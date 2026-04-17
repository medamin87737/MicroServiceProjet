import { Controller, Get } from '@nestjs/common';
import { WelcomeConfigService } from './welcome-config.service';

@Controller()
export class AppController {
  constructor(private readonly welcomeConfig: WelcomeConfigService) {}

  @Get('health')
  health() {
    return { status: 'UP' };
  }

  @Get('welcome')
  welcome() {
    return this.welcomeConfig.getWelcome();
  }
}
