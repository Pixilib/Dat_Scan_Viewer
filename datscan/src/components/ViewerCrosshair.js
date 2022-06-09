import { cache, getEnabledElement, getRenderingEngine, RenderingEngine } from '@cornerstonejs/core';
import { CrosshairsTool, ToolGroupManager, Enums, utilities as CsUtils } from '@cornerstonejs/tools';
import jumpToWorld from '@cornerstonejs/tools/dist/esm/utilities/viewport/jumpToWorld.js'

import ViewerVolumeRoot from "./ViewerVolumeRoot"

export default () => {
    //Every ID for the first row of viewport
    const viewID1 = 'view1';
    const viewID12 = 'view12';
    const viewID13 = 'view13';
    const renderID1 = 'myRenderingEngineId1';
    const viewPID1 = 'Viewport1';
    const viewPID12 = 'Viewport12';
    const viewPID13 = 'Viewport13';
    const toolGID1 = 'ToolGroupID1';

    //Every ID for the second row of viewport
    const viewID2 = 'view2';
    const viewID22 = 'view22';
    const viewID23 = 'view23';
    const renderID2 = 'myRenderingEngineId2';
    const viewPID2 = 'Viewport2';
    const viewPID22 = 'Viewport22';
    const viewPID23 = 'Viewport23';
    const toolGID2 = 'ToolGroupID2'

    // We need a bigger cache because we're loading 2 volumes
    cache.setMaxCacheSize(2147483648);

    const getCoord = () => {

        //Functions for the crosshair of the 3 first viewports
        const viewportColors = {
            [viewPID1]: 'rgb(200, 0, 0)',
            [viewPID12]: 'rgb(200, 200, 0)',
            [viewPID13]: 'rgb(0, 200, 0)',
        };

        const viewportReferenceLineControllable = [
            viewPID1,
            viewPID12,
            viewPID13,
        ];

        const viewportReferenceLineDraggableRotatable = [
            viewPID1,
            viewPID12,
            viewPID13,
        ];

        const viewportReferenceLineSlabThicknessControlsOn = [
            viewPID1,
            viewPID12,
            viewPID13,
        ];

        function getReferenceLineColor(viewportId) {
            return viewportColors[viewportId];
        };

        function getReferenceLineControllable(viewportId) {
            const index = viewportReferenceLineControllable.indexOf(viewportId);
            return index !== -1;
        };

        function getReferenceLineDraggableRotatable(viewportId) {
            const index = viewportReferenceLineDraggableRotatable.indexOf(viewportId);
            return index !== -1;
        };

        function getReferenceLineSlabThicknessControlsOn(viewportId) {
            const index =
                viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
            return index !== -1;
        };

        //Functions for the crosshair of the 3 second viewports
        const viewportColors2 = {
            [viewPID2]: 'rgb(200, 0, 0)',
            [viewPID22]: 'rgb(200, 200, 0)',
            [viewPID23]: 'rgb(0, 200, 0)',
        };

        const viewportReferenceLineControllable2 = [
            viewPID2,
            viewPID22,
            viewPID23,
        ];

        const viewportReferenceLineDraggableRotatable2 = [
            viewPID2,
            viewPID22,
            viewPID23,
        ];

        const viewportReferenceLineSlabThicknessControlsOn2 = [
            viewPID2,
            viewPID22,
            viewPID23,
        ];

        function getReferenceLineColor2(viewportId) {
            return viewportColors2[viewportId];
        };

        function getReferenceLineControllable2(viewportId) {
            const index = viewportReferenceLineControllable2.indexOf(viewportId);
            return index !== -1;
        };

        function getReferenceLineDraggableRotatable2(viewportId) {
            const index = viewportReferenceLineDraggableRotatable2.indexOf(viewportId);
            return index !== -1;
        };

        function getReferenceLineSlabThicknessControlsOn2(viewportId) {
            const index =
                viewportReferenceLineSlabThicknessControlsOn2.indexOf(viewportId);
            return index !== -1;
        };

        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //Here I add and activate boths crosshairs for the two rows of viewport but It wont work
        //If I put one croshair in comment the other one will work
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        //Getting the toolgroup of the first 3 viewports and adding the crosshair
        //You need to comment this section to see the other crosshair work.
        const toolGroup1 = ToolGroupManager.getToolGroup(toolGID1);
        console.log(toolGroup1);

        toolGroup1.addTool(CrosshairsTool.toolName, {
            getReferenceLineColor,
            getReferenceLineControllable,
            getReferenceLineDraggableRotatable,
            getReferenceLineSlabThicknessControlsOn,
        });

        toolGroup1.setToolEnabled(CrosshairsTool.toolName);
        toolGroup1.setToolActive(CrosshairsTool.toolName, {
            bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
        });

        //Getting the toolgroup of the second 3 viewports and adding the crosshair
        //You need to comment this section to see the other crosshair work.
        const toolGroup2 = ToolGroupManager.getToolGroup(toolGID2);
        console.log(toolGroup2);

        toolGroup2.addTool(CrosshairsTool.toolName, {
            getReferenceLineColor2,
            getReferenceLineControllable2,
            getReferenceLineDraggableRotatable2,
            getReferenceLineSlabThicknessControlsOn2,
        });

        toolGroup2.setToolEnabled(CrosshairsTool.toolName);
        toolGroup2.setToolActive(CrosshairsTool.toolName, {
            bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
        });

        // console.log(toolGroup2.getToolInstance(CrosshairsTool.toolName));
        // const element21 = getEnabledElement(document.getElementById('view2'));
        // toolGroup2.getToolInstance(CrosshairsTool.toolName)._jump(element21, [200, 300, -700]);

        const re = getRenderingEngine(renderID1);
        const viewport = re.getViewport('Viewport2');
        jumpToWorld(viewport, [200, 300, -700]);

    }

    return (
        <>
            <h1>Volume viewports with 2 crosshair</h1>
            <button id="crosshair-button" onClick={getCoord}>CrossHair</button>
            <div id="viewers" style={{ flexDirection: 'column', display: 'flex' }}>
                <ViewerVolumeRoot renderID={renderID1} toolGroupId={toolGID1}></ViewerVolumeRoot>
            </div>
        </>

    )
}