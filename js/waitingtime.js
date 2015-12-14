var WaitingTimeboard = React.createClass({
        displayName: "Dashboard",

        onHubChange: function onHubChange(e) {
          this.setState({ hub: e.target.value });
        },
        onResolutionChange: function onResolutionChange(e) {
          this.setState({ resolution: e.target.value });
        },
        getInitalState: function getInitalState() {
          return { resolution: "today", hub: this.props.hubs[0] };
        },
        componentWillMount: function componentWillMount() {
          this.setState({ resolution: "today", hub: this.props.hubs[0] });
        },
        render: function render() {
          return React.createElement(
            "div",
            null,            
            React.createElement(MenuBar, { onHubChange: this.onHubChange, onResolutionChange: this.onResolutionChange, hubs: this.props.hubs }),
            React.createElement("div",{id:"test"},""),
            React.createElement(GraphBox, { hub: this.state.hub, resolution: this.state.resolution })
          );
        }
      });

      var MenuBar = React.createClass({
        displayName: "MenuBar",

        render: function render() {
          return React.createElement(
            "div",
            null,
            React.createElement(HubMenu, { onChange: this.props.onHubChange, hubs: this.props.hubs }),
            React.createElement(TimeLine, { onChange: this.props.onResolutionChange, times: ['today', 'weekbyweek', 'MonthByMonth', 'All time'] })
          );
        }
      });

      var HubMenu = React.createClass({
        displayName: "HubMenu",

        render: function render() {
          var createoption = function createoption(option) {
            return React.createElement(
              "option",
              { value: option },
              " ",
              option,
              " "
            );
          };
          return React.createElement(
            "select",
            { onChange: this.props.onChange },
            this.props.hubs.map(createoption)
          );
        }
      });

      var TimeLine = React.createClass({
        displayName: "TimeLine",

        render: function render() {
          var createTimeOption = function createTimeOption(time) {
            return React.createElement(
              "option",
              { value: time },
              " ",
              time,
              " "
            );
          };
          return React.createElement(
            "span",
            { className: "timeline" },
            React.createElement(
              "select",
              { onChange: this.props.onChange },
              " ",
              this.props.times.map(createTimeOption)
            )
          );
        }
      });

      var GraphBox = React.createClass({
        displayName: "GraphBox",

        getInitalState: function getInitalState() {
          return { graphdata: [] };
        },
        componentWillMount: function componentWillMount(){
          date_today = new Date().toISOString().substr(0,10);
          this.setState({graphdata: [['dum1','time1'],[date_today,0]]});
        },
        componentWillReceiveProps: function componentWillReceiveProps(nextProps){
          var Orders = Parse.Object.extend("Orders");
          var query = new Parse.Query(Orders);
          var graph_data = [];
          var that = this;
          query.equalTo("hubid",nextProps.hub);
          if(nextProps.resolution=="today"){
            today_date = new Date();
            dates_array=[]; 
            waiting_time_array=[0];           
            today_date = today_date.toISOString().substr(0,10);
            query.startsWith("orderdatetime", today_date);            
            dates_array.push([today_date]);
            //that.setState({"graphdata":[["hub","Total waiting time"],[today_date]]});
          }
          else if(nextProps.resolution=="weekbyweek"){
            today_date = new Date();
            dates_array = [];
            waiting_time_array = [];
            for(var i=0;i<7;i++){
              dates_array.push([new Date(today_date.getTime()-24*60*60*1000*i).toISOString().substr(0,10)]);
              waiting_time_array.push(0);
            }
            week_ago_date = new Date(today_date.getTime()-24*60*60*1000*6).toISOString().substr(0,10);
            today_date = today_date.toISOString();
            query.greaterThanOrEqualTo("orderdatetime",week_ago_date);
            query.lessThanOrEqualTo("orderdatetime",today_date);
          }
          else if(nextProps.resolution=="MonthByMonth"){
            today_date = new Date();
            dates_array =[];
            waiting_time_array = [];
            for(var i=0;i<30;i++){
              dates_array.push([new Date(today_date.getTime()-24*60*60*1000*i).toISOString().substr(0,10)]);
              waiting_time_array.push(0);
            }
            month_ago_date = new Date(today_date.getTime()-24*60*60*1000*30).toISOString().substr(0,10);
            today_date = today_date.toISOString();
            query.greaterThanOrEqualTo("orderdatetime",month_ago_date);
            query.lessThanOrEqualTo("orderdatetime", today_date);
          }
          query.find({
            success: function(results) {              
              
              for(var j=0;j<dates_array.length;j++){              
                for(var k=0;k<results.length;k++){
                  if(results[k].get("orderdatetime").substr(0,10)==dates_array[j][0]){
                    waiting_time_array[j] += results[k].get("waitingtime");
                  }                              
                }                
              }
              that.setState({"graphdata":[
              {
                x: dates_array,
                y: waiting_time_array,
                type: 'bar'
              }
                ]});
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
        },
        render: function render() {             
          var data = this.state.graphdata;          
          var titlee = "Total waiting time for hub "+this.props.hub+" for "+this.props.resolution;
          var layout = {
            title: titlee
          };
          Plotly.newPlot('test', data, layout);    

          return React.createElement(
            "div",
            { id: "teste", style: ({ width: '480px' }, { height: '400px' }) },
            " "
          );
        }
      });