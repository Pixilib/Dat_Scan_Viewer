import { RenderingEngine } from "@cornerstonejs/core";
import ViewportType from "@cornerstonejs/core";

export default () => {

    const divAff = document.createElement('div');
    const imageId = 'wadouri:/images/MR000000.dcm'

    // const renderingEngineId = 'myEngine';
    const renderingEngine = new RenderingEngine('myEngine')
    renderingEngine.init();


    const viewportIdentifiant = 'IMAGES_STACK'
    const viewportInput = {
        viewportId: viewportIdentifiant,
        element: divAff,
        type: ViewportType.STACK,
    };

    renderingEngine.enableElement(viewportInput);

    const viewport = renderingEngine.getViewport(viewportIdentifiant);

    viewport.setStack(imageId, 60);

    viewport.render()

    return (
        <>
        </>
    )

}