import { object } from './object';
import pad from './pad';
import REST from './rest';
import Chart from 'chart.js/auto';
import * as $ from 'jquery';


const API = '/api';

const metrics = {
  id: '',
  list: {},
  set_datetime: function (which, d) {
    $('#history_' + which + '_date').val(
      pad(1 + d.getMonth()) + '/' + pad(d.getDate()) + '/' + d.getFullYear()
    );
    $('#history_' + which + '_time').val(
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':00'
    );
  },
  init: function () {
    // $('#history_end_date').datepicker();
    // $('#history_start_date').datepicker();

    $('#metrics_results_outer').hide();
    $('#metrics_results_close').on('click', function () {
      $('#metrics_results_outer').hide();
    });
    $('#history_end_now').on('click', function () {
      const now = new Date();
      metrics.set_datetime('end', now);
    });
    $('#history_range_hour').on('click', function () {
      const now = new Date();
      metrics.set_datetime('end', now);
      now.setTime(now.getTime() - 3600000);
      metrics.set_datetime('start', now);
    });
    $('#history_range_day').on('click', function () {
      const now = new Date();
      metrics.set_datetime('end', now);
      now.setTime(now.getTime() - 86400000);
      metrics.set_datetime('start', now);
    });
    $('#history_range_week').on('click', function () {
      const now = new Date();
      metrics.set_datetime('end', now);
      now.setTime(now.getTime() - 604800000);
      metrics.set_datetime('start', now);
    });
    $('#history_range_month').on('click', function () {
      const now = new Date();
      metrics.set_datetime('end', now);
      now.setTime(now.getTime() - 2592000000);
      metrics.set_datetime('start', now);
    });
    $('#history_range_year').on('click', function () {
      const now = new Date();
      metrics.set_datetime('end', now);
      now.setTime(now.getTime() - 31536000000);
      metrics.set_datetime('start', now);
    });
    $('#metrics_samples').on('click', 'label', function (e) {
      e.preventDefault();
      metrics.id = $(this).attr('metric_id');
      metrics.load(metrics.id);
    });
    $('#metrics_rates').on('click', 'label', function (e) {
      e.preventDefault();
      metrics.id = $(this).attr('metric_id');
      metrics.load(metrics.id);
    });
    $('#metric_select').on('change', function () {
      metrics.id = $(this).val().toString();
      metrics.graph();
    });
    $('#metrics_display').on('click', function (e) {
      e.preventDefault();
      metrics.graph();
    });
  },
  graph: function () {
    $('#metrics_display').attr('disabled', 'disabled');
    $('#metrics_graph').html('<canvas id="chart"></canvas>');
    const object_id = object.selected_id;
    const start_time =
      Date.parse(
        $('#history_start_date').val() + ' ' + $('#history_start_time').val()
      ) / 1000;
    const end_time =
      Date.parse(
        $('#history_end_date').val() + ' ' + $('#history_end_time').val()
      ) / 1000;
    REST.retrieve(
      `${API}/object/${object_id}/metric/${metrics.id}?start_time=${start_time}&end_time=${end_time}`,
      { type: metrics.id }
    )
      .then(function (res) {
        //		    let out = [];
        if (res.length) {
          const config = {
            type: 'line',
            options: {
              elements: {
                line: {
                  tension: 0,
                },
              },
            },
            data: {
              labels: [],
              datasets: [
                {
                  label: 'Maximum',
                  backgroundColor: 'rgba(255,0,0,0.1)',
                  borderColor: 'rgba(220,220,220,1)',
                  pointColor: 'rgba(220,220,220,1)',
                  pointStrokeColor: '#fff',
                  pointHighlightFill: '#fff',
                  pointHighlightStroke: 'rgba(220,220,220,1)',
                  data: [],
                  spanGaps: false,
                },
                {
                  label: 'Average',
                  backgroundColor: 'rgba(255,0,255,0.1)',
                  borderColor: 'rgba(187,151,205,1)',
                  pointColor: 'rgba(187,151,205,1)',
                  pointStrokeColor: '#fff',
                  pointHighlightFill: '#fff',
                  pointHighlightStroke: 'rgba(187,151,205,1)',
                  data: [],
                  spanGaps: false,
                },
                {
                  label: 'Minimum',
                  backgroundColor: 'rgba(0,0,255,0.1)',
                  borderColor: 'rgba(151,187,205,1)',
                  pointColor: 'rgba(151,187,205,1)',
                  pointStrokeColor: '#fff',
                  pointHighlightFill: '#fff',
                  pointHighlightStroke: 'rgba(151,187,205,1)',
                  data: [],
                  spanGaps: false,
                },
                /*
			      {
			      label: "Standard Devation",
			      fillColor: "rgba(151,205,187,0.2)",
			      strokeColor: "rgba(151,205,187,1)",
			      pointColor: "rgba(151,205,187,1)",
			      pointStrokeColor: "#fff",
			      pointHighlightFill: "#fff",
			      pointHighlightStroke: "rgba(151,205,187,1)",
			      data: [],
			      }
			    */
              ],
            },
          };
          let absmin = res[0][1];
          let absmax = res[0][3];
          for (let i = 0; i < res.length; i++) {
            const min = res[i][1];
            const avg = res[i][2];
            const max = res[i][3];
            //			let std = row.attr('std')-0;
            //			std = Math.log10(std*1000);
            if (min < absmin) {
              absmin = min;
            }
            if (max < absmax) {
              absmax = max;
            }
            /*
		      out.push('<tr>' +
		      '<td>'+row.attr('t')+'</td>' +
		      '<td>'+min+'</td>' +
		      '<td>'+avg+'</td>' +
		      '<td>'+max+'</td>' +
		      //				 '<td>'+std+'</td>' +
		      '</tr>');
		    */
            const ts = new Date(res[i][0] * 1000);
            config.data.labels.push(ts.toLocaleString());
            if (res[i][2]) {
              config.data.datasets[0].data.push(max);
              config.data.datasets[1].data.push(avg);
              config.data.datasets[2].data.push(min);
            } else {
              config.data.datasets[0].data.push(NaN);
              config.data.datasets[1].data.push(NaN);
              config.data.datasets[2].data.push(NaN);
            }
            //			data.datasets[3].data.unshift(std);
          }
          // const range = absmax - absmin;
          /*
		  for (let i=0;i<data.datasets[3].data.length;i++){
		  const before = data.datasets[3].data[i];
		  data.datasets[3].data[i] = range / data.datasets[3].data[i];
		  data.datasets[3].data[i] += absmin;
		  console.log(before+' - '+data.datasets[3].data[i]);
		      }
		*/
          //		    out.unshift('<table class="metrics" style="float: left;"><tr><th>Date/Time</th><th>Min</th><th>Avg</th><th>Max</th><th>Std</th></tr>');
          //		    out.push('</table>');
          //		    $('#metrics_data').html(out.join(''));
          // const ctx = ($('#chart').get(0) as HTMLCanvasElement).getContext(
          //   '2d'
          // );
          // From Chart.min.js
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          new Chart(document.getElementById('chart'), config);
          // $('#metrics_graph').text(JSON.stringify(config));
        }
        $('#metrics_display').removeAttr('disabled');
      })
      .catch(function () {
        alert('there was an error');
        $('#metrics_display').removeAttr('disabled');
      });
  },
  load: function (metric_id) {
    //	metrics.chart.clear();
    const select = $('#metric_select') as JQuery<HTMLSelectElement>;
    select[0].options.length = 0;
    const content = [];
    for (const id in metrics.list) {
      content.push(
        '<option value="' + id + '">' + metrics.list[id] + '</option>'
      );
    }
    select.append(content.join('')).val(metric_id);
  },
  select: function () {
    const id = object.selected_id;
    if (id) {
      metrics.list = {};
      REST.retrieve(`/api/object/${id}/metric`).then(function (res) {
        const map = {};
        for (const metric_id in res) {
          const fullname = res[metric_id].name;
          const parts = fullname.split(':');
          const name = parts.pop();
          const c = parts.join(' - ');
          res[metric_id].name = name;
          if (typeof map[c] === 'undefined') {
            map[c] = {};
          }
          map[c][metric_id] = res[metric_id];
          metrics.list[metric_id] = fullname;
        }
        const out = [];
        for (const c in map) {
          out.push('<tr><th colspan="6">' + c + '</th></tr>');
          for (const m in map[c]) {
            out.push(
              '<tr title="' +
                map[c][m].description +
                '">' +
                '<td>' +
                map[c][m].name +
                '</td>' +
                '<td>' +
                map[c][m].unit +
                '</td>' +
                '<td>' +
                map[c][m].min +
                '</td>' +
                '<td>' +
                map[c][m].avg +
                '</td>' +
                '<td>' +
                map[c][m].max +
                '</td>' +
                '<td>' +
                map[c][m].std +
                '</td>' +
                '<td><label for="metrics_results" class="fa fa-history" metric_id="' +
                m +
                '"></label></td>' +
                '</tr>'
            );
          }
        }
        $('#metrics_samples').html(out.join(''));
      });
    }
  },
};

export default metrics;
export { metrics };
