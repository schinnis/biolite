Biolite Shopify Theme
======================
Repo for the Biolite Shopify theme development.


<br>
### Development Environment Config


1. Cloen the repo and open the main folder. Copy `config-sample.yml` and rename it to `config.yml`. 

2. Install `shopify_theme` ruby gem with `gem install shopify_theme`. (May need sudo)

3. In the Shopify Admin, go to Apps -> Private Apps -> Shopify CLI to get the API Key & Password. As of 10/28/2014 they are:
    * **API Key**: `3f303ccf94aaf7c1ee519f40cfc46f43`
    * **Password**: `15dc54093806a300a6c76c4bda461136`

4. In the Shopify Admin, go to Themes. Find your theme (Ex: *Biolite-&lt;FirstName&gt;*). Click customize theme. In the URL bar, you can find your `theme_id`

5. In the theme directory, after installing the CLI tools, run `theme configure <api_key> <password> <site_url> <theme_id>`


<br>
### Workflow

The Github master will function as the HEAD for the theme master, *Biolite-Master*. Each developer should always first merge their changes with this repository before publishing to the main Shopify theme.

Each user works on a "branch" which is a duplicate of the main theme, *Biolite-Master*. This allows each developer to run the `theme watch` command and make use of the edit-save-upload-refresh flow.

To view your changes on your unpublished theme, go to Themes -> Customize -> Preview in new window. The URL should have this format: `http://biolite-2.myshopify.com/?design_theme_id=<theme_id>`




<br>
### References / Documentation

* [shopify_theme ruby gem github](https://github.com/Shopify/shopify_theme)
* ["How do I edit my theme and preview my changes without affecting my live shop?"](http://docs.shopify.com/support/your-website/themes/how-do-i-edit-my-theme-and-preview-my-changes-without-affecting-my-live-shop)