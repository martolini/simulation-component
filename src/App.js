import React, { Component } from 'react';
import request from 'superagent'
import ReactHighcharts from 'react-highcharts'
import Loading from 'react-loading'
import { findDOMNode } from 'react-dom'
import './styles.less'

const REST_URL = 'https://api.edgebet.net/'


export class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      loading: false
    }
  }

  onSubmit(filters) {
    this.setState({
      loading: true,
      data: []
    })
    request
      .get(REST_URL + 'userbets/simulate')
      .query(filters)
      .end((err, res) => {
        if (!err) {
          this.setState({data: res.body, loading:false})
        } else {
          this.setState({loading: false})
        }
      })
  }
  render() {
    return (
      <div className='simulation-container'>
        <div className='row'>
          <Form onSubmit={this.onSubmit.bind(this)} loading={this.state.loading}/>
        </div>
        <div className='row'>
          <div className='col s12'>
            { this.state.data.length > 0 &&
              <ReactHighcharts config={{
                title: {
                  text: 'Bet sizing simulation'
                },
                xAxis: {
                  categories: this.state.data.map((_, i) => i)
                },
                yAxis: {
                  type: 'logarithmic',
                  title: 'Bankroll'
                },
                series: [{
                  data: this.state.data,
                  name: 'Bankroll'
                }]
              }} />
            }
          </div>
        </div>
      </div>
    );
  }
}

class Form extends Component {

  onSubmit(e) {
    e.preventDefault()
    this.props.onSubmit({
      bankroll: +this.bankroll.value,
      nCycles: +this.nCycles.value,
      kellyFrac: +this.kellyFrac.value,
      openBets: +this.openBets.value
    })
  }

  componentDidMount() {
    let element = findDOMNode(this.kellyFrac)
    $(element).ready(function() {
      $('select').material_select()
    })
  }

  render() {
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <div className='input-field col s6 m3'>
          <input id='open-bets' type='number' defaultValue={20} className='validate' required ref={ref => this.openBets = ref} />
          <label htmlFor='open-bets'>Open bets</label>
        </div>
        <div className='input-field col s6 m3'>
          <input id='n-cycles' type='number' className='validate' defaultValue={365} required ref={ref => this.nCycles = ref} />
          <label htmlFor='n-cycles'>Cycles</label>
        </div>
        <div className='input-field col s6 m3'>
          <select ref={ref => this.kellyFrac = ref} defaultValue="0.3">
            <option value="0.3">Low risk (30% Kelly)</option>
            <option value="0.5">Medium risk (50% Kelly)</option>
            <option value="1">High risk (100% Kelly)</option>
          </select>
          <label>Bet size</label>
        </div>
        <div className='input-field col s6 m3'>
          <input id='bankroll' type='number' className='validate' required defaultValue={10000} ref={ref => this.bankroll = ref }/>
          <label htmlFor='bankroll'>Starting bankroll</label>
        </div>
        <div className='input-field col s6 m3'>
          <button className="btn waves-effect waves-light" type="submit" name="action" disabled={this.props.loading}>Simulate</button>
        </div>
        { this.props.loading &&
          (<div className='col s12 m12'>
            <Loading type='bars' className='valign' color={'black'} delay={0}/>
          </div>)
        }
      </form>
    )
  }
}
