'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the cat\'s pajamas ' + chalk.red('bee-trader') + ' generator!'
    ));

    var prompts = [
      {
        name: 'appName',
        message: 'What your app\'s name??'
      },
      {
        name: 'userName',
        message: 'What your github user name??'
      },
      {
        type: 'confirm',
        name: 'isTraderNet',
        message: 'Would you like to include trader-net?',
        default: true
      },
      {
        type: 'confirm',
        name: 'isRabbit',
        message: 'Would you like to include rabbitmq?',
        default: true
      },
      {
        type: 'checkbox',
        name: 'rabbit_pub_sub',
        message: 'Rabbitmq could pub / sub ?',
        choices : ["sub", "pub"],
        default: ["sub"],
        when: function (hash) {return hash.isRabbit;}
      },
      {
        type: 'list',
        name: 'handler',
        message: 'Create handler file ?',
        choices : [{name : "create with mongo", value : "create_mongo"}, {name : "create", id : "create"}, { name : "no create", id : "no"}],
        default: "create_mongo"
      }
    ];

    this.prompt(prompts, function (props) {
      this.props = props;
      this.destinationRoot(path.join(this.destinationRoot(), '/' + this.props.appName));
      done();
    }.bind(this));
  },

  writing: {

    packageJSON: function () {
      this.template(this.templatePath('_package.json'), this.destinationPath('package.json'));
    },

    app: function () {

      this.template(this.templatePath('_index.ts'), this.destinationPath("src/index.ts"));
      if (this.props.handler != "no") {
        this.template(this.templatePath('_handler.ts'), this.destinationPath("src/handler.ts"));
      }
      this.template(this.templatePath('_readme.md'), this.destinationPath("readme.md"));
      this.template(this.templatePath('_tsd.d.ts'), this.destinationPath("typings/tsd.d.ts"));

      this.fs.copy(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copy(
        this.templatePath('Dockerfile'),
        this.destinationPath('Dockerfile')
      );

      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('editorconfig')
      );

      this.fs.copy(
        this.templatePath('node.d.ts'),
        this.destinationPath('typings/node/node.d.ts')
      );

      this.fs.copy(
        this.templatePath('tmpl.env'),
        this.destinationPath('.envs/_tmpl.env')
      );

      this.fs.copy(
        this.templatePath('tsconfig.json'),
        this.destinationPath('src/tsconfig.json')
      );
    }
  },

  install: function () {
    this.npmInstall();
  }
});
