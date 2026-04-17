import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { NotesModule } from './notes/notes.module';
import { WelcomeConfigService } from './welcome-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://127.0.0.1:27017/ms_notes'),
      }),
      inject: [ConfigService],
    }),
    NotesModule,
  ],
  controllers: [AppController],
  providers: [WelcomeConfigService],
})
export class AppModule {}
