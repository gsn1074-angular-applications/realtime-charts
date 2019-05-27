import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { UpdateApprovalModel } from '../interfaces/updateApproval.model';
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import * as dc from 'dc';
import * as crossfilter from 'crossfilter2';
import { Dimension } from 'crossfilter2';

var me: any;

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {

  private init = new BehaviorSubject<boolean>(false);
  init$ = this.init.asObservable();

  private update = new Subject<UpdateApprovalModel[]>();
  update$ = this.update.asObservable();

  private refresh = new Subject();
  refresh$ = this.refresh.asObservable();

  public xfilter: crossfilter.Crossfilter<UpdateApprovalModel>;
  public filterDim: Dimension<UpdateApprovalModel, string>;
  public approvalsIndexedByApprover: Dimension<UpdateApprovalModel, string>;
  public approvalsIndexedByApprovedTime: Dimension<UpdateApprovalModel, string>;
  public approvalsGroupedByDay: crossfilter.Group<UpdateApprovalModel, crossfilter.NaturallyOrderedValue, {}>;
  public approvalsGroupedByApprover: crossfilter.Group<UpdateApprovalModel, crossfilter.NaturallyOrderedValue, {}>;

  public approvalHubConnection: signalR.HubConnection;

  public constructor()
  {
    me = this;

    //d3.csv("../../assets/ApprovalsByApprovers.csv").then(function(data) {

      let cleanData: UpdateApprovalModel[] = new Array<UpdateApprovalModel>();

      // data.forEach(function (d) {

      //      cleanData.push({ApprovedAt: new Date(d.ApprovedAt), ApprovedBy: d.ApprovedBy.match('^.+\\((.+)\\)$')[1]});

      // });

      me.xfilter = crossfilter(cleanData);
      me.filterDim = me.xfilter.dimension(function(d) {return Date.parse(d.approvedAt);})

      me.approvalsIndexedByApprovedTime = me.xfilter.dimension(function(d) {return Date.parse(d.approvedAt);});
      me.approvalsGroupedByDay = me.approvalsIndexedByApprovedTime.group(d3.timeDay);

      me.approvalsIndexedByApprover = me.xfilter.dimension(function(d) {return d.approvedBy;});
      me.approvalsGroupedByApprover = me.approvalsIndexedByApprover.group(); 

      console.log("service constructor complete");
     // me.init.next(true);

    //});

    //this.startConnection();
  } 

  public sync() {
    this.refresh.next();
  }

  public startConnection = () => {

    console.log("startConnection called.");

    this.approvalHubConnection = new signalR.HubConnectionBuilder()
                                  .withUrl('https://localhost:44342/approvalHub', {skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets})
                                  .build();
    
    this.approvalHubConnection.on('primeChartData', (data: UpdateApprovalModel[]) => {

      let cleanData: UpdateApprovalModel[] = new Array<UpdateApprovalModel>();

      data.forEach(function (d) {

           cleanData.push({approvedAt: new Date(d.approvedAt), approvedBy: d.approvedBy.match('^.+\\((.+)\\)$')[1]});

      });

      console.log("loaded data: " + cleanData.length);

      this.xfilter.add(cleanData);
      this.init.next(true);
    });

    this.approvalHubConnection.on('update', (data) => {

        data.forEach(function (d) {
            d.approvedAt = new Date(d.approvedAt);
            d.approvedBy = d.approvedBy;
        });

        console.log("updated data: " + data.length);

        this.xfilter.add(data);
        this.update.next(data);
    });

    this.approvalHubConnection.start()
                              .then(() => console.log('Connection started'))
                              .then(() => this.primeChartData())
                              .catch(err => console.log('Error while starting connection: ' + err));
  }

  public primeChartData = () => {

    console.log("called primeChartData backend");

    this.approvalHubConnection.invoke('primeChartData')
                              .catch(err => console.error(err));
  }
}

