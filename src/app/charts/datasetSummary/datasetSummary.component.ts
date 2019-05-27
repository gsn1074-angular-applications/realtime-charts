import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ApprovalService } from '../../services/approval.service';

var me = this;

@Component({
  selector: 'dataset-summary',
  templateUrl: './datasetSummary.component.html',
 // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetSummaryComponent implements OnInit
{
  @Input() title: string = "";
  @Input() totalItemsLabel: string = "";
  @Input() totalProcessorsLabel: string = "";
  @Input() totalTimeUnitsLabel: string = "";

  public totalItems: any;
  public totalProcessors: any;
  public totalTimeUnits: any;

  public constructor(private approvalService: ApprovalService) {}

  public ngOnInit() {

    this.approvalService.init$.subscribe(data => {

        if(data)
        {
            this.init();
        }
    });
  }

  private init() {
console.log("in init");
    this.totalItems = this.approvalService.xfilter.groupAll().reduceCount().value();
console.log("total items " + this.totalItems);
    this.totalProcessors = this.approvalService.approvalsGroupedByApprover.size();
console.log("total processors " + this.totalProcessors);
    this.totalTimeUnits = this.approvalService.approvalsGroupedByDay.reduceCount().all().length;
console.log("total time units " + this.totalTimeUnits);
  }
}