#!/usr/bin/env ruby
require 'rubygems'
require 'shopify_api'
require 'thor'
require 'abbrev'
require 'yaml'
require 'pry'
require 'httparty'

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

    desc "update_prices", "Update Variant Prices"
    def update_prices()

      puts ''
      
      file   = config_file(nil)
      config = YAML.load(File.read(file))
      ShopifyAPI::Base.site = site_from_config(config)


      # the namespace & DOM elements to use
      namespace     = 'pricing'

      # all the currencies that we want to support
      currencies    = ['GBP', 'JPY', 'AUD', 'EUR', 'CAD', 'SEK']

      # extract all the latest currency conversion rates
      response = HTTParty.get('https://cdn.shopify.com/s/javascripts/currencies.js')
      conversions   = {}
      currencies.each do |c|
        conversions[c] = response.parsed_response[/#{c}\":([0-9]+.[0-9]+)/, 1].to_f
      end
      puts 'conversions: ' + conversions.inspect

      all_products = ShopifyAPI::Product.all
      all_products.each do |p|

        puts ''
        puts 'Product: ' + p.title + ' (id:' + p.id.to_s + ')'

        # clear out the meta prices array for this product
        meta_prices     = {}

        # find all the meta prices
        p.metafields.each do |m|

          # clean out the shappify ones
          #puts m.destroy if m.namespace == 'pricing'
          #puts m.destroy if m.namespace.include?('shappify')
          #puts m.inspect

          # loop through meta and get each currencies hard price if it has been defined
          currencies.each do |c|
            meta_prices[c] = m.value if m.namespace == namespace && m.key == c
          end

        end

        puts 'meta_prices: ' + meta_prices.to_json

        # reset the default variant
        default = {}

        p.variants.each do |v|
          #puts v.inspect
          default = v if v.option1 == 'Default'
        end

        default_price           = (default.price || p.price).to_f.round(2)
        default_price_in_cents  = (default_price.to_f * 100).to_i
        
        puts 'default_price: ' + default_price.to_s

        currencies.each do |c|

          # if we have a defined price in meta, convert and use it - else use the default price
          if meta_prices[c]

            puts '-- use meta price: ' + meta_prices[c].to_s
            converted_price_in_cents  = (meta_prices[c].to_f * 100)
            us_price_in_cents         = (converted_price_in_cents * conversions[c])
          
          else
            
            puts '-- use default price: ' + default_price.to_s
            converted_price_in_cents  = ((default_price_in_cents / conversions[c]))
            us_price_in_cents         = (converted_price_in_cents * conversions[c])

            #add the meta field for this currency if it doesn't exist
            meta = p.add_metafield(ShopifyAPI::Metafield.new({
              :description => c + ' Pricing',
              :namespace => namespace,
              :key => c,
              :value => (converted_price_in_cents / 100).round(2).to_s,
              :value_type => 'string'
            })).save          
            puts 'meta: ' + meta.inspect

          end

          us_price = (us_price_in_cents / 100).round(2)

          reconverted = (((us_price.to_f * 100) / conversions[c]) / 100).round(2)

          puts c + ' conversion rate: ' + conversions[c].to_s + ' | converted_price_in_cents: ' + converted_price_in_cents.to_s + ' | us_price: ' + us_price.to_s + ' | reconverted: ' + reconverted.to_s

          #variant = ShopifyAPI::Variant.where(:product_id => p.id, :option1 => namespace + '-' + c)

          variant = p.variants.find { |v| v.option1 == namespace + '-' + c }
          destroy = variant.destroy if variant
          puts 'variant.destroy: ' + destroy.inspect     

          variant = ShopifyAPI::Variant.new({
              :product_id => p.id,
              :option1 => namespace + '-' + c,
              :price => us_price.to_s,
              :requires_shipping => true,
              :sku => default.sku || '',
              :taxable => true,
              :title => namespace + '-' + c,
            }).save
          puts 'variant.new: ' + variant.inspect          

        end

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