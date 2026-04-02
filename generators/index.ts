import GeneratorBase from 'yeoman-generator';

export = class RootGenerator extends GeneratorBase {
  end(): void {
    this.log('');
    this.log('Use an explicit generator command:');
    this.log('  yo t-generator:react-app [appName]');
    this.log('  yo t-generator:react-add [featureName]');
    this.log('  yo t-generator:nestjs-app [appName]');
  }
};
