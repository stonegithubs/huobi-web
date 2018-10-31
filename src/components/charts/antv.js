import CONFIG from '@/config';
export let G2 = null;
export let F2 = null;
export let Slider = null;
export let DataSet = null;


/**
 * 异步获取antv组件
 * @return {Object}
 */
export default async function fetchAntv() {
    
    let pList = [];
    
    pList.push(
        import(/* webpackChunkName: "DataSet" */ '@antv/data-set').then(res => {
            DataSet = res;
        })
    );

    if (CONFIG.isMobile) {
        pList.push(
            import(/* webpackChunkName: "f2" */ '@antv/f2').then(res => {
                F2 = res;
                F2.track(false);
            })
        );
    } else {
        pList.push(
            import(/* webpackChunkName: "g2" */ '@antv/g2').then(res => {
                G2 = res;
                G2.track(false);
                import(/* webpackChunkName: "Slider" */ '@antv/g2-plugin-slider').then(res => {
                    Slider = res;
                })
            })
        );
    }
    
    await Promise.all(pList);

    return {
        G2,
        F2,
        Slider,
        DataSet,
    }
}