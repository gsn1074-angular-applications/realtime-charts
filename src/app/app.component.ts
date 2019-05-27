import { Component, OnInit } from '@angular/core';
import { ApprovalService } from './services/approval.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(public approvalService: ApprovalService, private http: HttpClient) { }

  ngOnInit() {
    this.approvalService.startConnection();
  }
}
