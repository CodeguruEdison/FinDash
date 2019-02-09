import React, { Component } from 'react';
import { Row, Col, Glyphicon, ControlLabel, Checkbox, Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';//DropdownButton,
import StockChart from './StockChart';
import './daterangepicker.css';
const DateRangePicker = require('react-bootstrap-daterangepicker');
const moment = require('moment');

class StockPanel extends Component {
  constructor(props) {
    super(props);
    this.stockSelection = this.stockSelection.bind(this);
    this.stockCategories = this.stockCategories.bind(this);
    this.stockList = this.stockList.bind(this);
    this.stockCorrelationList = this.stockCorrelationList.bind(this);
    this.stockName = this.stockName.bind(this);
    this.currencyCorrelationList = this.currencyCorrelationList.bind(this);
    this.onDateSet = this.onDateSet.bind(this);
    this.onToggleStock = this.onToggleStock.bind(this);
    this.onSelectAllStocks = this.onSelectAllStocks.bind(this);
    this.onCorrDropdownToggle = this.onCorrDropdownToggle.bind(this);
    this.onCorrStockSelect = this.onCorrStockSelect.bind(this);
    this.noCorrData = this.noCorrData.bind(this);
    this.onToggleNormalization = this.onToggleNormalization.bind(this);

    this.state = {
      stocks: props.stocks || {},
      currencies: {},
      displayStocks: this.props.displayStocks || [],
      normalized: props.normalized || false,
      startDate: moment("2016-09-01"),
      endDate: moment("2017-07-05"),
      corrDropdownExpanded: false,
      corrSelections: [],
      correlations: []
    };
  }

  componentDidMount() {
    if(Object.keys(this.state.stocks).length === 0)
      fetch('/api/stocks').then(res => res.json()).then(stocks => this.setState({stocks}));

    fetch('/api/stocks/currencies')
      .then(res => res.json()).then(currencies => this.setState({currencies}));
  }

  render() {

    // Initialize Date Variables
    const start = this.state.startDate.format('YYYY-MM-DD');
    const end = this.state.endDate.format('YYYY-MM-DD');
    let label = start + ' - ' + end;
    if (start === end) { label = start; }

    const newDisplayStocks = Object.keys(this.state.stocks).length === 0 ? [] :
      JSON.parse(JSON.stringify(this.state.displayStocks));

    return(
      <div id="stock-panel">

        {this.props.topPanel && this.stockSelection()}

        <Row className="equal">

          <Col sm={4} className="flex-col">
            <div className="align-bottom">
              <Checkbox className="align-left larger" checked={this.state.normalized} onChange={this.onToggleNormalization}>
                Relative Performance
              </Checkbox>
            </div>
          </Col>

          <Col sm={4}>
            <h2>Stock Analysis</h2>
          </Col>

        </Row>

        <StockChart displayStocks={newDisplayStocks} stockName={this.state.stocks.name}
                    correlationStocks={this.state.correlations} noCorrData={this.noCorrData}
                    startDate={start} endDate={end} normalized={this.state.normalized}/>

        <Row>

          {/*<DropdownButton title='Plot Correlation' id='corr-sel' className="larger" style={{marginRight: '100px'}}*/}
                          {/*open={this.state.corrDropdownExpanded} onToggle={this.onCorrDropdownToggle}>*/}
            {/*<div style={{display: 'table'}}>*/}
              {/*<ToggleButtonGroup type="checkbox" style={{display: 'table-cell'}}>*/}
                {/*{this.stockCorrelationList(this.state.displayStocks)}*/}
              {/*</ToggleButtonGroup>*/}
              {/*<ToggleButtonGroup type="checkbox" style={{display: 'table-cell'}}>*/}
                {/*{this.currencyCorrelationList(this.state.currencies)}*/}
              {/*</ToggleButtonGroup>*/}
            {/*</div>*/}
          {/*</DropdownButton>*/}

          <ControlLabel className="larger" >Date Range:</ControlLabel>{' '}
          <DateRangePicker startDate={this.state.startDate} endDate={this.state.endDate} onApply={this.onDateSet}>
            <Button className="selected-date-range-btn">
              <div className="larger" ><Glyphicon glyph="calendar" /> <span>{label}</span> <span className="caret"/></div>
            </Button>
          </DateRangePicker>

        </Row>

        <br/>

        {typeof this.props.topPanel === 'undefined' && this.stockSelection()}

      </div>
    );
  }

  stockSelection() {
    return <div className="row">
      {this.state.stocks.categories && this.stockCategories(this.state.stocks, this.state.displayStocks)}
    </div>
  }

  stockCategories(stocks, displayStocks) {
    const categories = Object.keys(stocks.categories);
    const width = Math.floor(12/categories.length).toString();
    return (categories.map(category => {

      const selected = stocks.categories[category].map(stock => stock).every(stock => displayStocks.includes(stock));

      return (<div key={"category-"+category} className={"category col-md-"+width}>

        <h3>{category}</h3>

        <ToggleButtonGroup type="checkbox" className="full-width">
          <ToggleButton id={'all-'+category} value={category} checked={selected} onChange={this.onSelectAllStocks} block>
            <strong><Glyphicon glyph='check'/> Select All</strong>
          </ToggleButton>
        </ToggleButtonGroup>

        {this.stockList(stocks.categories[category], displayStocks)}

      </div>);
    }));
  }

  stockList(arr, displayStocks) {
    return (arr.map((elem) => {
      return (
        <ToggleButtonGroup key={elem} type="checkbox" className="full-width margin-top-sm">
          <ToggleButton id={'plot-'+elem} value={elem} className='btn-stock'
                        checked={displayStocks.includes(elem)} onChange={this.onToggleStock} block>
            {this.stockName(elem)}
          </ToggleButton>
        </ToggleButtonGroup>
      );
    }));
  }

  stockCorrelationList(arr) {
    return (arr.map(elem =>
      <ToggleButton key={'corr-'+elem} id={'corr-'+elem} value={elem} className='btn-stock'
                    checked={this.state.corrSelections.includes(elem)}
                    onChange={this.onCorrStockSelect} block>
        {this.stockName(elem)}
      </ToggleButton>
    ));
  }

  stockName(ticker) {
    return this.state.stocks.name ? this.state.stocks.name[ticker]+' ('+ticker+')' : ticker;
  }

  currencyCorrelationList(hash) {
    return (Object.keys(hash).map(sym =>
      <ToggleButton key={'corr-'+sym} id={'corr-'+sym} value={sym}
                    checked={this.state.corrSelections.includes(sym)}
                    onChange={this.onCorrStockSelect} block>{hash[sym]}</ToggleButton>
    ));
  }

  onDateSet(event, picker) {
    this.setState({
      startDate: picker.startDate,
      endDate:   picker.endDate
    });
  }

  onToggleStock(event) {
    const stock = event.target.value;
    const add = event.target.checked;
    this.setState(function(prevState) {
      const displayStocks = prevState.displayStocks.slice(0);
      if (add) {
        displayStocks.push(stock);
      } else {
        const index = displayStocks.indexOf(stock);
        if (index > -1) {
          displayStocks.splice(index, 1);
        }
      }
      return {displayStocks: displayStocks};
    });
  }

  async onSelectAllStocks(event) {
    const category = event.target.value;
    const add = event.target.checked;
    const displayStocks = this.state.displayStocks;
    if(add){
      await this.state.stocks.categories[category].forEach((stock) => {
        if(!displayStocks.includes(stock)){
          displayStocks.push(stock);
          selectStock('plot-', stock);
        }
      });
    } else {
      await this.state.stocks.categories[category].forEach((stock) => {
        const index = displayStocks.indexOf(stock);
        if (index > -1){
          displayStocks.splice(index, 1);
          deselectStock('plot-', stock);
        }
      });
    }
    this.setState({displayStocks});
  }

  onCorrDropdownToggle(open, event, eventDetails){
    if(eventDetails.source === 'rootClose')
      this.setState({corrDropdownExpanded: !this.state.corrDropdownExpanded});
    else if(this.state.corrSelections.length < 2)
      this.setState({corrDropdownExpanded: true});
  }

  async onCorrStockSelect(event) {
    const add = event.target.checked;
    const stock = event.target.value;
    if(add) {
      const stockButton = document.getElementById("plot-"+stock);
      if(stockButton && stockButton.style["background-color"])
        document.getElementById("corr-"+stock).style["background-color"] = stockButton.style["background-color"];

      await this.setState(() => {
        this.state.corrSelections.push(stock);
      });
      if(this.state.corrSelections.length === 2){

        const label = correlationLabel(this.state.corrSelections[0] , this.state.corrSelections[1]);
        this.state.correlations.push(label);

        this.setState({corrSelections: [], corrDropdownExpanded: false});
      }
    } else {
      this.setState(() => {
        const index = this.state.corrSelections.indexOf(stock);
        if (index > -1)
          this.state.corrSelections.splice(index, 1);
      });
    }
  }

  noCorrData(badCorr){
    alert("Sorry, I don't have any correlation data between "+badCorr.stock1+" and "+badCorr.stock2);
    const badCorrCombined = correlationLabel(badCorr.stock1 , badCorr.stock2);
    this.setState(prevState => {
      const corrs = prevState.correlations;
      corrs.splice(corrs.indexOf(badCorrCombined), 1);
    });
  }

  onToggleNormalization(event) {
    const normalized = event.target.checked;
    this.setState({normalized});
  }

}

function correlationLabel(var1, var2){
  return ' Corr ( ' + var1+' , '+var2 + ' )';
}

function deselectStock(prefix, stock) {
  const stockButton = document.getElementById(prefix+stock);
  stockButton.classList.remove('active');
}

function selectStock(prefix, stock) {
  const stockButton = document.getElementById(prefix+stock);
  stockButton.classList.add('active');
}

export default StockPanel;
