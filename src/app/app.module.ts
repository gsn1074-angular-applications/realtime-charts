import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DataTableComponent } from './charts/dataTable/dataTable.component';
import { BarChartComponent } from './charts/barChart/barChart.component';
import { TimeSeriesChartComponent } from './charts/timeSeriesChart/timeSeriesChart.component';
import { DatasetSummaryComponent } from './charts/datasetSummary/datasetSummary.component';

@NgModule({
  declarations: [
    AppComponent,
    DataTableComponent,
    BarChartComponent,
    TimeSeriesChartComponent,
    DatasetSummaryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
