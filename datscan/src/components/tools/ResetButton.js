import { getRenderingEngine } from '@cornerstonejs/core';


export default ({ renderingEngineId, viewportId }) => {

    const resetViewport = () => {
        const renderingEngine = getRenderingEngine(renderingEngineId)

        const vieport = renderingEngine.getViewport(viewportId)

        //On reset la caméra
        vieport.resetCamera();
        //On reset les propriétes (deplacement H/V...)
        // vieport.resetProperties();
        vieport.render();
    }


    return (
        <>
            <button id="buttonToolBar" onClick={resetViewport}>Reset viewport</button>
        </>
    )
}