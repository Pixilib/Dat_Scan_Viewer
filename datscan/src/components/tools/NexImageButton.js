import { Enums, getRenderingEngine } from '@cornerstonejs/core';


export default ({ renderingEngineId, viewportId }) => {

    const nextImage = () => {

        //Recuperation de l'engine actuel
        const renderingEngine = getRenderingEngine(renderingEngineId);

        let viewport = renderingEngine.getViewport(viewportId)
        const imageId = viewport.getCurrentImageId();
        console.log(imageId)

        //Recup de l'index de l'image
        const firstColonIndex = imageId.indexOf('=');
        const indice = imageId.substring(firstColonIndex + 1)

        //Recupareration de l'url pur
        const frameIndex = imageId.indexOf('frame=');
        const url = imageId.substring(0, frameIndex - 1);

        //Recuperation de la div d'affichage
        const divAff = document.getElementById("viewer")

        const viewportInput = {
            viewportId: viewportId,
            element: divAff,
            type: Enums.ViewportType.STACK,
        };
        renderingEngine.enableElement(viewportInput);

        viewport = renderingEngine.getViewport(viewportId)

        //Recup du viewport

        let count = parseInt(indice)
        count++;
        const newimageId = url + "?frame=" + count;
        console.log(newimageId)

        const stack = [newimageId]
        viewport.setStack(stack)
        viewport.render()

    }


    return (
        <>
            <button id="buttonToolBar" onClick={nextImage}>Next Image</button>
        </>
    )
}