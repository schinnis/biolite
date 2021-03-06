#!/usr/bin/env ruby
require 'rubygems'
require 'shopify_api'
require 'thor'
require 'abbrev'
require 'yaml'
require 'pry'

module ShopifyAPI
  class Cli < Thor
    include Thor::Actions
     
    class ConfigFileError < StandardError
    end
 
    tasks.keys.abbrev.each do |shortcut, command|
      map shortcut => command.to_sym
    end
     
    desc "list", "list available connections"
    def list
      available_connections.each do |c|
        prefix = default?(c) ? " * " : "   "
        puts prefix + c
      end
    end
     
    desc "add CONNECTION", "create a config file for a connection named CONNECTION"
    def add(connection)
      file = config_file(connection)
      if File.exist?(file)
        raise ConfigFileError, "There is already a config file at #{file}"
      else
        config = {'protocol' => 'https'}
        config['domain']   = ask("Domain? (leave blank for #{connection}.myshopify.com)")
        config['domain']   = "#{connection}.myshopify.com" if config['domain'].empty?
        puts "\nopen https://#{config['domain']}/admin/api in your browser to get API credentials\n"
        config['api_key']  = ask("API key?")
        config['password'] = ask("Password?")
        create_file(file, config.to_yaml)
      end
      if available_connections.one?
        default(connection)
      end
    end
     
    desc "remove CONNECTION", "remove the config file for CONNECTION"
    def remove(connection)
      file = config_file(connection)
      if File.exist?(file)
        remove_file(default_symlink) if default?(connection)
        remove_file(file)
      else
        no_config_file_error(file)
      end
    end
     
    desc "edit [CONNECTION]", "open the config file for CONNECTION with your default editor"
    def edit(connection=nil)
      file = config_file(connection)
      if File.exist?(file)
        if ENV['EDITOR'].present?
          `#{ENV['EDITOR']} #{file}`
        else
          puts "Please set an editor in the EDITOR environment variable"
        end
      else
        no_config_file_error(file)
      end
    end
     
    desc "show [CONNECTION]", "output the location and contents of the CONNECTION's config file"
    def show(connection=nil)
      connection ||= default_connection
      file = config_file(connection)
      if File.exist?(file)
        puts file
        puts `cat #{file}`
      else
        no_config_file_error(file)
      end
    end
     
    desc "default [CONNECTION]", "show the default connection, or make CONNECTION the default"
    def default(connection=nil)
      if connection
        target = config_file(connection)
        if File.exist?(target)
          remove_file(default_symlink)
          `ln -s #{target} #{default_symlink}`
        else
          no_config_file_error(file)
        end
      end
      if File.exist?(default_symlink)
        puts "Default connection is #{default_connection}"
      else
        puts "There is no default connection set"
      end
    end
     
    desc "console [CONNECTION]", "start an API console for CONNECTION"
    def console(connection=nil)
      file = config_file(connection)
       
      config = YAML.load(File.read(file))
      puts "using #{config['domain']}"
      ShopifyAPI::Base.site = site_from_config(config)
       
      require 'irb'
      require 'irb/completion'
      ARGV.clear
      IRB.start
    end

    desc "main_theme_id", "output the main theme id (in use) for this store"
    def main_theme_id
      file = config_file(nil)
      config = YAML.load(File.read(file))
      ShopifyAPI::Base.site = site_from_config(config)
      main_theme = ShopifyAPI::Theme.where(:role => 'main')
      puts main_theme[0].id
    end

    desc "theme_name [ID]", "output the theme name for this theme ID"
    def theme_name(id)
      file = config_file(nil)
      config = YAML.load(File.read(file))
      ShopifyAPI::Base.site = site_from_config(config)
      all_themes = ShopifyAPI::Theme.all
      all_themes.each do |t|
        theme = t.to_json
        json_theme = JSON.parse(theme)
        puts json_theme["name"] if json_theme["id"].to_s == id.to_s
      end
    end

    desc "create_deploy_theme [THEME_ZIP] [THEME_NAME]", "Create a new deploy theme and set it to main"
    def create_deploy_theme(theme_zip, theme_name)
      file = config_file(nil)
      config = YAML.load(File.read(file))
      ShopifyAPI::Base.site = site_from_config(config)
      result = ShopifyAPI::Theme.create(:name => theme_name, :src => theme_zip, :role => 'main')
      puts result
    end

    desc "update_theme_name [THEME_ID] [THEME_NAME]", "Update the theme name"
    def update_theme_name(theme_id, theme_name)
      file   = config_file(nil)
      config = YAML.load(File.read(file))
      ShopifyAPI::Base.site = site_from_config(config)
      all_themes = ShopifyAPI::Theme.all
      all_themes.each do |t|
        theme = t.to_json
        json_theme = JSON.parse(theme)
        this_theme = t if json_theme["id"].to_s == theme_id.to_s
      end
      if this_theme
        puts this_theme.update_attributes(:name => theme_name)
      else
        puts 'Theme not found by id: ' + theme_id.to_s
      end
    end
     
    private
     
    def shop_config_dir
      @shop_config_dir ||= File.join(ENV['HOME'], '.shopify', 'shops')
    end
     
    def default_symlink
      @default_symlink ||= File.join(shop_config_dir, 'default')
    end
     
    def config_file(connection)
      if connection
        File.join(shop_config_dir, "#{connection}.yml")
      else
        default_symlink
      end
    end
     
    def site_from_config(config)
      protocol = config['protocol'] || 'https'
      api_key  = config['api_key']
      password = config['password']
      domain   = config['domain']
     
      ShopifyAPI::Base.site = "#{protocol}://#{api_key}:#{password}@#{domain}/admin"
    end
     
    def available_connections
      @available_connections ||= begin
        pattern = File.join(shop_config_dir, "*.yml")
        Dir.glob(pattern).map { |f| File.basename(f, ".yml") }
      end
    end
     
    def default_connection_target
      @default_connection_target ||= File.readlink(default_symlink)
    end
     
    def default_connection
      @default_connection ||= File.basename(default_connection_target, ".yml")
    end
     
    def default?(connection)
      default_connection == connection
    end
     
    def no_config_file_error(filename)
      raise ConfigFileError, "There is no config file at #{file}"
    end
  end
  ShopifyAPI::Cli.start
end