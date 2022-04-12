import { getRenderingEngine } from '@cornerstonejs/core';


export default ({ renderingEngineId, viewportId }) => {

    const flipHorizontal = () => {
        const renderingEngine = getRenderingEngine(renderingEngineId)

        // Get the volume viewport
        const viewport = renderingEngine.getViewport(viewportId)


        // Flip the viewport vertically
        const { flipHorizontal } = viewport.getProperties();

        viewport.flip({ flipHorizontal: !flipHorizontal });

        viewport.render();
    }


    return (
        <>
            <button id="buttonToolBar" onClick={flipHorizontal}>Horizontal Flip</button>
        </>
    )
}