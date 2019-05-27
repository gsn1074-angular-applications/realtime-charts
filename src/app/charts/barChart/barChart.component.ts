import { Dimension } from 'crossfilter2';
import { Component, OnInit, Input } from '@angular/core';
import { Margin } from '../../interfaces/margin.model';
import { ApprovalService } from '../../services/approval.service';
import { UpdateApprovalModel } from '../../interfaces/updateApproval.model';
import * as d3 from 'd3';
import * as dc from 'dc';
import * as crossfilter from 'crossfilter2';
import { ChangeDetectionStrategy } from '@angular/core';

var me: any;

@Component({
  selector: 'bar-chart',
  templateUrl: './barChart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent implements OnInit
{
    @Input() title: string;

    public columns: [string, string] = ['approvedBy', 'approvedAt'];

    public margin: Margin;
    public width: number;
    public height: number;
    public innerWidth: number;
    public innerHeight: number;
    public xValue;
    public yValue;
    public xScale: d3.ScaleBand<string>;
    public yScale: d3.ScaleLinear<number, number>;
    // public onMouseOver;
    // public onMouseOut;

    public constructor(public approvalService: ApprovalService) {
        
        me = this;

        this.margin = {top: 20,  right: 20, bottom: 100, left: 40};
        this.width = 1200;
        this.height = 400;
        this.innerWidth = this.width - this.margin.left - this.margin.right;
        this.innerHeight = this.height - this.margin.top - this.margin.bottom;
        this.xValue = function (d) { return d.key; };
        this.yValue = function (d) { return d.value; };
        this.xScale = d3.scaleBand().padding(0.1);
        this.yScale = d3.scaleLinear();
        // this.onMouseOver = function () { };
        // this.onMouseOut = function () { };
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
        console.log("barchart init invoked");
        d3.select("#selectedApprover").text(function(d) {return "All";});
    }

    private update() {
        console.log("barchart update invoked");
        d3.select("#approvers").datum(me.approvalService.approvalsGroupedByApprover.all()).call(me.draw);
    }

    public X(d): number {
        return me.xScale(me.xValue(d));
    }

    public Y(d): number {
        return me.yScale(me.yValue(d));
    }

    onClick(d, i, n) {

        me.approvalService.approvalsIndexedByApprover.filter(d.key);

        d3.select("#selectedApprover").text(function() {return d.key;});
        d3.selectAll(".bar").classed("selected", false);
        d3.select(n[i]).classed("selected", d3.select(n[i]).classed("selected") ? false : true);

        me.approvalService.sync();
    }   

    private draw(selection) {

        selection.each(function (data) {

            var svg = d3.select(this).selectAll("svg").data([data]);
            var svgEnter = svg.enter().append("svg");
            var gEnter = svgEnter.append("g");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");
            me.innerWidth = me.width - me.margin.left; - me.margin.right;
            me.innerHeight = me.height - me.margin.bottom - me.margin.top;
            svg.merge(svgEnter)
                .attr("width", me.width)
                .attr("height", me.height);
            var g = svg.merge(svgEnter).select("g")
                .attr("transform", "translate(" + me.margin.left + "," + me.margin.top + ")");
            me.xScale.rangeRound([0, me.innerWidth])
                .domain(data.map(me.xValue));
            me.yScale.rangeRound([me.innerHeight, 0])
                .domain([0, d3.max(data, me.yValue)]);
            g.select(".x.axis")
                .attr("transform", "translate(0," + me.innerHeight + ")")
                .call(d3.axisBottom(me.xScale));
            g.select(".y.axis")
                .call(d3.axisLeft(me.yScale).ticks(10))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Frequency");
            var bars: any = g.selectAll(".bar")
                .data(function (d) { return d; });
            bars.enter().append("rect")
                .attr("class", "bar")
                .merge(bars)
                .attr("x", function(d) {return me.X(d);})
                .attr("y", function(d) {return me.Y(d);})
                .attr("width", me.xScale.bandwidth())
                .attr("height", function (d) { return me.innerHeight - me.Y(d);})
                //.on("mouseover", onMouseOver)
                //.on("mouseout", onMouseOut);
                .on("click", me.onClick);
            bars.exit().remove();
        });
    }
}

