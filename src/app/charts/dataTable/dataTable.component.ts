import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import * as crossfilter from 'crossfilter2';
import { Dimension } from 'crossfilter2';
import { UpdateApprovalModel } from '../../interfaces/updateApproval.model';
import { ApprovalService } from '../../services/approval.service';
import { ChangeDetectionStrategy } from '@angular/core';

var me: any;

@Component({
  selector: 'data-table',
  templateUrl: './dataTable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent implements OnInit
{
    @Input() title: string;

    public columns: [string, string] = ['approvedBy', 'approvedAt'];

    public constructor(private approvalService: ApprovalService) {
        me = this;
    }

    public ngOnInit() {

        this.approvalService.init$.subscribe(data => {
            
            if(data)
            {
                this.update();
            }
        });

        this.approvalService.refresh$.subscribe(data => {
            this.update();
        });
    }

    private update() {
        this.draw();
    }

    private draw()
    {
        var columns = this.columns;

        var tbody = d3.select('#approvals').select('tbody');

        var rows = tbody.selectAll('tr').remove();
            rows = tbody.selectAll('tr')
                .data(me.approvalService.approvalsIndexedByApprovedTime.bottom(10))
                .enter()
                .append('tr');

        var cells = rows.selectAll('td')
                    .data(function (row) {
                    return columns.map(function (column) {
                        return { column: column, value: row[column] };
                    });
                    })
                    .enter()
                    .append('td')
                    .text(function (d) { return d.value; });
    }
}