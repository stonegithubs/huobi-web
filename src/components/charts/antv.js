import CONFIG from '@/config';
export let G2 = null;
export let F2 = null;
export let Chart = null;
export let Slider = null;
export let DataSet = null;


/**
 * F2相关依赖
 */
const fetchF2 = async function() {
    await import(/* webpackChunkName: "f2" */ '@antv/f2/lib/index').then(res => {
        F2 = res;
        Chart = F2.Chart;

        F2.track(false);
    });
    await Promise.all([
        import(/* webpackChunkName: "interaction-pan" */ '@antv/f2/lib/interaction/pan'),
        import(/* webpackChunkName: "interaction-pinch" */ '@antv/f2/lib/interaction/pinch'),
        import(/* webpackChunkName: "scroll-bar" */ '@antv/f2/lib/plugin/scroll-bar').then(ScrollBar => {
            F2.Chart.plugins.register(ScrollBar);
        }),
    ]);
}

/**
 * G2相关依赖
 */
const fetchG2 = async function() {
    await import(/* webpackChunkName: "g2" */ '@antv/g2').then(res => {
        G2 = res;
        Chart = G2.Chart;
        G2.track(false);
    });
    await Promise.all([
        import(/* webpackChunkName: "Slider" */ '@antv/g2-plugin-slider').then(res => {
            Slider = res;
        })
    ]);
}
/**
 * 异步获取antv组件
 * @return {Object}
 */
export async function fetchAntv() {

    let pList = [];

    pList.push(
        import(/* webpackChunkName: "DataSet" */ '@antv/data-set').then(res => {
            DataSet = res;
        })
    );

    if (CONFIG.isMobile) {
        pList.push(fetchF2());
    } else {
        pList.push(fetchG2());
    }

    await Promise.all(pList);

    return {
        Chart: Chart,
        F2,
        G2,
        Slider,
        DataSet,
    }
}



/**
 * @param {Object} param.dataSetConfig
 * @param {Object[]} param.data
 * @return {Object} param.transformConfig
 */
export function createDataSet({ dataSetConfig, transformConfig } = {}) {
    if (!dataSetConfig.state) {
        throw Error('dataSetConfig.sate must be a Object');
    }
    const dataSet = new DataSet(dataSetConfig);
    const dataView = dataSet.createView();
    dataView.source(dataSet.state.sourceData);

    if (Array.isArray(transformConfig)) {
        transformConfig.forEach(function (config) {
            dataView.transform(config);
        });
        if (dataSetConfig.state.start !== undefined && dataSetConfig.state.end !== undefined) {
            dataView.transform({
                type: "filter",
                callback: function (obj) {
                    var time = new Date(obj.time).getTime(); // !注意：时间格式，建议转换为时间戳进行比较
                    return time >= dataSet.state.start && time <= dataSet.state.end;
                },
            });
        }
    }
    return {
        dataSet,
        dataView
    };
}

/**
 * @param {DataSet}
 * @param {HTMLElement}
 * @param {Slider}
 */
export function createSilder(dataSet, dataView, container) {
    // 创建 Slider
    const slider = new Slider({
        container: container,
        width: 'auto',
        height: 26,
        padding: CONFIG.isMobile ? [0, 10, 0, 50] : [0, 100, 0, 120],
        start: dataSet.state.start, // 和状态量对应
        end: dataSet.state.end,
        xAxis: 'time',
        yAxis: 'value',
        scales: {
            time: {
                type: 'time',
                tickCount: 100,
                mask: 'M/DD H:mm:ss'
            }
        },
        data: dataView,
        backgroundChart: {
            type: 'line'
        },
        onChange: function onChange(_ref) {
            var startValue = _ref.startValue,
                endValue = _ref.endValue;
            dataSet.setState('start', startValue);
            dataSet.setState('end', endValue);
        }
    });
    slider.render();
    return slider;
}
