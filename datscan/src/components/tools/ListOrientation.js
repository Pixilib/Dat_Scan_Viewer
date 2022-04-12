import { getRenderingEngine, CONSTANTS } from '@cornerstonejs/core';
import $ from 'jquery'

export default ({ renderingEngineId, viewportId }) => {

    const changeOrientation = () => {
        const orientation = $('#orientation-select option:selected').text();

        let viewUp;
        let viewPlaneNormal;
        switch (orientation) {
            case 'Axial':
                viewUp = CONSTANTS.ORIENTATION.AXIAL.viewUp;
                viewPlaneNormal = CONSTANTS.ORIENTATION.AXIAL.sliceNormal;

                break;
            case 'Sagittal':
                viewUp = CONSTANTS.ORIENTATION.SAGITTAL.viewUp;
                viewPlaneNormal = CONSTANTS.ORIENTATION.SAGITTAL.sliceNormal;

                break;
            case 'Coronal':
                viewUp = CONSTANTS.ORIENTATION.CORONAL.viewUp;
                viewPlaneNormal = CONSTANTS.ORIENTATION.CORONAL.sliceNormal;

                break;
            case 'Oblique':
                // Some random oblique value for this dataset
                viewUp = [-0.5962687530844388, 0.5453181550345819, -0.5891448751239446];
                viewPlaneNormal = [
                    -0.5962687530844388, 0.5453181550345819, -0.5891448751239446,
                ];

                break;
            default:
                throw new Error('undefined orientation option');
        }

        const renderingEngine = getRenderingEngine(renderingEngineId)

        // Get the volume viewport
        const viewport = renderingEngine.getViewport(viewportId)

        viewport.setCamera({ viewUp, viewPlaneNormal });
        // Reset the camera after the normal changes
        viewport.resetCamera();
        viewport.render();

    }




    return (
        <>
            <select name="orientation" id="orientation-select" defaultValue={'Axial'} onChange={changeOrientation}>
                <option>Axial</option>
                <option>Sagittal</option>
                <option>Coronal</option>
                <option >Oblique</option>
            </select>
        </>
    )
}