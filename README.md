Biolite Shopify Theme
======================
Repo for the Biolite Shopify theme development.


### Development Environment Setup

1. Get the repo cloned locally with `git clone https://github.com/fiftyandfiftyorg/biolite`

1. Assuming you have RVM installed...

1. cd into the root directory & `bundle install`

1. In the Shopify Admin, go to Themes. Find/create your theme (Ex: *Dev-&lt;FirstName&gt;*). Click customize theme. In the URL bar, you can find your `theme_id` 

1. In the Shopify Admin, go to Apps -> Private Apps -> Development & Deployment to get the API Key & Password. As of 10/28/2014 they were:
    * **API Key**: `3f303ccf94aaf7c1ee519f40cfc46f43`
    * **Password**: `15dc54093806a300a6c76c4bda461136`
    * 
    
1. cd into the 'theme' directory, and run `theme configure <api_key> <password> biolite-2.myshopify.com <theme_id>`

1. cd into the 'theme' directory, and run 'cp shopify-theme-sample.yml shopify-theme.yml'

1. open shopify-theme.yml and change the dev_theme to your 'theme_id'

1. cd into the 'theme' directory, and run `rake start_local_dev`

1. This will create a branch with the same name as your Theme, update the Theme at Shopify and start theme watch locally


### Development Environment Process

1. cd into the root directory and `git pull origin master` to update your local files

1. `git checkout <theme_name>` to start working locally

1. cd to the theme directory and run `theme watch`

1. run `theme open` to view your changes at Shopify

1. merge your changes to the master branch when ready




### Deployment

1. run `shopify add biolite-2` - if not set up yet
    * **API Key**: `3f303ccf94aaf7c1ee519f40cfc46f43`
    * **Password**: `15dc54093806a300a6c76c4bda461136`
    * **Editor**: `irb`
    * 

1. update master in github (deploy will only pull from master)

1. cd into the 'theme' directory, and run `rake deploy`

1. verify the live site & roll back by publishing the previous deployed theme from the Shopify Admin


### Notes

1. Each developer works from their own branch of the master (deployed) branch. First merge your changes to master before deploying.

1. Each deployed theme will be called *Deploy_2014-10-10_120105* - Rollback to a previous deploy by publishing an older deploy from the shopify Admin.

1. To develop locally, you must have an Internet connection and run `theme watch` so your changes are uploaded to your development theme at Shopify

1. To view your changes on your development theme, run `theme open`

1. Shopify Cheatsheet: http://cheat.markdunkley.com


### References / Documentation

* [shopify_theme ruby gem github](https://github.com/Shopify/shopify_theme)
* ["How do I edit my theme and preview my changes without affecting my live shop?"](http://docs.shopify.com/support/your-website/themes/how-do-i-edit-my-theme-and-preview-my-changes-without-affecting-my-live-shop)