import CONFIG from '@/config';
export let G = null;
export let Slider = null;
export let DataSet = null;


/**
 * 异步获取antv组件
 * @return {Object}
 */
export default async function fetchAntv() {
    
    let pList = [];
    import(/* webpackChunkName: "g2" */ '@antv/g2').then(res => {
        G = res;
        import(/* webpackChunkName: "Slider" */ '@antv/g2-plugin-slider').then(res => {
            Slider = res;
        })
    })
    pList.push(
        import(/* webpackChunkName: "DataSet" */ '@antv/data-set').then(res => {
            DataSet = res;
        })
    );
    pList.push(
        import(/* webpackChunkName: "f2" */ '@antv/f2').then(res => {
            G = res;
        })
    );
    if (CONFIG.isMobile) {
        pList.push(
            import(/* webpackChunkName: "f2" */ '@antv/f2').then(res => {
                G = res;
            })
        );
    } else {
        pList.push(
            import(/* webpackChunkName: "g2" */ '@antv/g2').then(res => {
                G = res;
                import(/* webpackChunkName: "Slider" */ '@antv/g2-plugin-slider').then(res => {
                    Slider = res;
                })
            })
        );
    }
    
    await Promise.all(pList);
    G.track(false);
    return {
        G,
        Slider,
        DataSet,
    }
}