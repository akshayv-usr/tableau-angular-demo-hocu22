import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { from, BehaviorSubject } from 'rxjs';
declare var tableau: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('textbox') tableauElement: ElementRef;
  @ViewChild('details') details: ElementRef;
  title = 'app';
  tableauViz: any;
  tableauViz2: any;
  url =
    'https://public.tableau.com/views/USSuperstoreDashboard_46/SalesbyState?:embed=y&:display_count=yes&publish=yes';

  trendUrl =
    'https://public.tableau.com/views/USSuperstoreDashboard_46/SalesvsDiscountbyMonth?:embed=y&:display_count=yes&publish=yes';

  showViz = true;
  width: '1200px';
  height: '300px';
  allYearFilters: any[];
  vizInit = false;
  trendWorkbook;
  // selectedState = new BehaviorSubject(null);
  selectedState: Promise<any>;

  test: any;

constructor() {}

  changeViz(event: Event, textboxValue: string) {
    event.preventDefault();
    event.stopPropagation();
    this.url = textboxValue;
    this.loadViz();
  }

  showCategory(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.url = 'https://public.tableau.com/shared/7B2YKQ2YP?:display_count=yes';
    this.loadViz();
  }

  getFilters() {
    this.tableauViz
      .getWorkbook()
      .getActiveSheet()
      .getFiltersAsync()
      .then(filters => {
        console.log(filters[1].getAppliedValues());
        this.allYearFilters = [...filters[1].getAppliedValues()];
        // FilterForApples = filters[0].getAppliedValues();
        // FilterForOranges = filters[1].getAppliedValues();
        return filters[1].getAppliedValues();
      });
  }

  setYear() {
    const yearFilters = this.getFilters();
    console.log(this.getFilters());
    let worksheet;

    this.tableauViz
      .getWorkbook()
      .activateSheetAsync('Sheet 1')
      .then(function(sheet) {
        worksheet = sheet;
      })
      .then(function() {
        return worksheet.applyFilterAsync(
          'YEAR(Date)',
          ['1990', '1991'],
          tableau.FilterUpdateType.REPLACE
        );
      });
  }

  allYears() {
    let worksheet;

    this.tableauViz
      .getWorkbook()
      .activateSheetAsync('Sheet 1')
      .then(function(sheet) {
        worksheet = sheet;
      })
      .then(function() {
        return worksheet.applyFilterAsync(
          'YEAR(Date)',
          '',
          tableau.FilterUpdateType.ALL
        );
      })
      .then(() => {
        this.getFilters();
      });
  }

  getUnderlyingData() {
    const sheet = this.tableauViz.getWorkbook().getActiveSheet();
    // If the active sheet is not a dashboard, then you can just enter:
    // viz.getWorkbook().getActiveSheet();
    const options = {
      maxRows: 10, // Max rows to return. Use 0 to return all rows
      ignoreAliases: false,
      ignoreSelection: true,
      includeAllColumns: false
    };

    sheet.getUnderlyingDataAsync(options).then(function(t) {
      const table = t;
      console.log(table);
    });
  }

  loadViz() {
    if (this.vizInit) {
      this.tableauViz.dispose();
      this.vizInit = false;
    }
    const placeholderDiv = document.getElementById('tableauViz');
    const options = {
      hideTabs: true,
      width: this.width,
      height: this.height,
      onFirstInteractive: () => {
        // The viz is now ready and can be safely used.
        this.vizInit = true;
        this.getFilters();
        this.listenToMapMarksSelection();
      }
    };
    console.log(tableau)
    this.tableauViz = new tableau.Viz(placeholderDiv, this.url, options);
  }

  listenToMapMarksSelection() {
    this.selectedState = new Promise((resolve, reject) => {
      this.tableauViz.addEventListener(
        tableau.TableauEventName.MARKS_SELECTION,
        this.onMarksSelection
      );
      console.log(this.tableauViz);
    });
  }

  onMarksSelection(marksEvent) {
    return marksEvent.getMarksAsync().then(reportSelectedMarks);

    function reportSelectedMarks(marks) {
      let html = '';

      for (let markIndex = 0; markIndex < marks.length; markIndex++) {
        const pairs = marks[markIndex].getPairs();
        html += '<b>Mark Selected: </b><ul>';

        for (let pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
          const pair = pairs[pairIndex];
          html += '<li><b>Field Name:</b> ' + pair.fieldName;
          html += '<br/><b>Value:</b> ' + pair.formattedValue + '</li>';
        }

        html += '</ul>';
      }

      const infoDiv = document.getElementById('markDetails');
      infoDiv.innerHTML = html;
    }
  }

  filterSalesvsDiscountbyMonth(state) {
    console.log(state);
    //   console.log(test);
    //   let worksheet;
    //   this.tableauViz2
    //     .getWorkbook()
    //     .activateSheetAsync('Sales vs Discount by Month')
    //     .then(sheet => {
    //       console.log(sheet);
    //       worksheet = sheet;
    //     })
    //     .then(() => {
    //       console.log(test);
    //       return worksheet.applyFilterAsync(
    //         test[0].fieldName,
    //         [...[test.value]],
    //         tableau.FilterUpdateType.REPLACE
    //       );
    //     });
    // });
  }

  loadTrend() {
    const placeholderDiv = document.getElementById('tableauViz2');
    console.log(placeholderDiv);
    const options = {
      hideTabs: true,
      width: this.width,
      height: this.height,
      onFirstInteractive: () => {
        // The viz is now ready and can be safely used.
        this.trendWorkbook = this.tableauViz2.getWorkbook();
      }
    };
    this.tableauViz2 = new tableau.Viz(placeholderDiv, this.trendUrl, options);
  }

  ngAfterViewInit() {
    this.loadViz();
    this.loadTrend();
  }
}
