
import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApolloModule } from 'apollo-angular';
import { EmojifyModule } from 'angular2-emojify';

import { AppComponent } from './app.component';
import { provideClient } from './client';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ApolloModule.forRoot(provideClient),
    EmojifyModule,
    InfiniteScrollModule
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule {}
