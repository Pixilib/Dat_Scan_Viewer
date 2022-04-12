import { getRenderingEngine } from '@cornerstonejs/core';


export default ({ renderingEngineId, viewportId }) => {

    const flipVertical = () => {
        const renderingEngine = getRenderingEngine(renderingEngineId)

        // Get the volume viewport
        const viewport = renderingEngine.getViewport(viewportId)


        // Flip the viewport vertically
        const { flipVertical } = viewport.getProperties();

        viewport.flip({ flipVertical: !flipVertical });

        viewport.render();
    }


    return (
        <>
            <button id="buttonToolBar" onClick={flipVertical}>Vertical Flip</button>
        </>
    )
}