import { Dimension } from 'crossfilter2';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Margin } from '../../interfaces/margin.model';
import { ApprovalService } from '../../services/approval.service';
import { UpdateApprovalModel } from '../../interfaces/updateApproval.model';
import * as d3 from 'd3';
import * as dc from 'dc';
import * as crossfilter from 'crossfilter2';

var me = this;

@Component({
 selector: 'time-series-chart',
 templateUrl: './timeSeriesChart.component.html',
 changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSeriesChartComponent implements OnInit
{
    @Input() title: string = "";

    public margin: Margin;
    public width: number;
    public height: number;
    public xValue;
    public yValue;
    public xScale: d3.ScaleTime<number, number>;
    public yScale: d3.ScaleLinear<number, number>;
    public area: d3.Area<[number, number]>;
    public line: d3.Line<[number, number]>;

    public constructor(private approvalService: ApprovalService) {
        
        me = this;

        this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        this.width = 1200;
        this.height = 120;
        this.xValue = function (d) { return d.key; };
        this.yValue = function (d) { return d.value; };
        this.xScale = d3.scaleTime();
        this.yScale = d3.scaleLinear();
        this.area = d3.area().x(this.X).y1(this.Y);
        this.line = d3.line().x(this.X).y(this.Y);
    }

    public ngOnInit() {

        this.approvalService.init$.subscribe(data => {

            if(data)
            {
                this.init();
                this.update();
            }
        });

        this.approvalService.refresh$.subscribe(data => {
            this.update();
        });
    }

    private init() {

        d3.select("#selectedApprover")
        .text(function(d) {return "All";});

        d3.select("#selectedDays")
        .text(function(d) {return me.approvalService.approvalsGroupedByDay.reduceCount().all().length;});

        d3.select("#selectionStartDate")
        .text(function(d) {return me.approvalService.approvalsGroupedByDay.all()[0].key;});

        d3.select("#selectionEndDate")
        .text(function(d) {return me.approvalService.approvalsGroupedByDay.all()[me.approvalService.approvalsGroupedByDay.size() - 1].key});
    }

    private update()
    {
        d3.select("#selectedApprovals").text(function(d) {return me.approvalService.xfilter.groupAll().reduceCount().value();});
        d3.select("#timeline").datum(me.approvalService.approvalsGroupedByDay.all()).call(me.draw);
    }

    private draw(selection) {

        selection.each(function (data) {

            // Convert data to standard representation greedily; this is needed for nondeterministic accessors.
            data = data.map(function (d, i) {
                return [me.xValue.call(data, d, i), me.yValue.call(data, d, i)];
            });

            me.xScale.domain(d3.extent(data, function (d) { return d[0]; }))
                .range([0, me.width - me.margin.left - me.margin.right]);

            me.yScale.domain([0, d3.max(data, function (d) { return d[1]; })])
                .range([me.height - me.margin.top - me.margin.bottom, 0]);

            var svg = d3.select(this).selectAll("svg").data([data]);
            var svgEnter = svg.enter().append("svg");
            var gEnter = svgEnter.append("g");
            gEnter.append("path").attr("class", "area");
            gEnter.append("path").attr("class", "line");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g")
                .attr("class", "brush")
                .call(d3.brushX()
                .extent(
                        [
                            [0, 0],
                            [me.xScale.range()[1], me.yScale.range()[0]]
                        ]
                    ).on("brush", me.brushed));

            // Update the outer dimensions.
            svg.merge(svgEnter).attr("width", me.width).attr("height", me.height);

            var g = svg.merge(svgEnter);
            
            // Update the inner dimensions.
            g.select("g").attr("transform", "translate(" + me.margin.left + "," + me.margin.top + ")");
            
            // Update the area path.
            g.select(".area").attr("d", me.area.y0(me.yScale.range()[0]));

            // Update the line path.
            g.select(".line").attr("d", me.line);

            // Update the x-axis.
            g.select(".x.axis")
                .attr("transform", "translate(0," + me.yScale.range()[0] + ")")
                .call(d3.axisBottom(me.xScale).tickSize(6));
        });
    }

    onBrushed(selected) {
        
        me.approvalService.approvalsIndexedByApprovedTime.filter(selected);

        var days = 0;
        me.approvalService.filterDim.group(d3.timeDay).all().forEach(function(x) {

            if(x.value > 0) {
                days++;
            }
        });

        d3.select("#selectedDays").text(function(d) {return days;});
        d3.select("#selectionStartDate").text(function(d) {return selected[0];});
        d3.select("#selectionEndDate").text(function(d) {return selected[1];});

        this.approvalService.sync();
    }

    brushed() {

        if (!d3.event.sourceEvent) {
            return;
        }

        if (!d3.event.selection) {
            return;
        }

        me.onBrushed(d3.event.selection.map(me.xScale.invert));
    }

    public X(d): number {
        return me.xScale(d[0]);
    }

    public Y(d): number {
        return me.yScale(d[1]);
    }
}