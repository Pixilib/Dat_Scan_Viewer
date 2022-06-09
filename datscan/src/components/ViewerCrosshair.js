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
        document.getElementById('CrossHairUI').style = "visibility: 'visible'";
        let viewPCenter = [];
        const elementView1 = document.getElementById(viewID1);
        const elementView2 = document.getElementById(viewID2);

        const elementCanvas1 = document.getElementById('canvasC1');
        const coordWorld1x = document.getElementById('worldC1_x');
        const coordWorld1y = document.getElementById('worldC1_y');
        const coordWorld1z = document.getElementById('worldC1_z');
        const sync1 = document.getElementById('sync1');

        const elementCanvas2 = document.getElementById('canvasC2');
        const coordWorld2x = document.getElementById('worldC2_x');
        const coordWorld2y = document.getElementById('worldC2_y');
        const coordWorld2z = document.getElementById('worldC2_z');
        const sync2 = document.getElementById('sync2');

        const renderingEngine1 = getRenderingEngine(renderID1);

        const viewp1 = renderingEngine1.getViewport(viewPID1);
        const viewp2 = renderingEngine1.getViewport(viewPID2);

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

        const instanceTG1 = toolGroup1.getToolInstance(CrosshairsTool.toolName);
        const instanceTG2 = toolGroup2.getToolInstance(CrosshairsTool.toolName);
        const element1 = getEnabledElement(elementView1);
        const element2 = getEnabledElement(elementView2);
        // toolGroup2.getToolInstance(CrosshairsTool.toolName)._jump(element21, [200, 300, -700]);

        const viewp2Data = viewp2.getImageData();
        viewPCenter = viewp2Data['imageData'].getCenter();

        let isClicked = false;
        let firstClick = false;
        let secondClick = false;

        let canvasRefPos1;
        let canvasRefPos2;
        let worldRefPos1;
        let worldRefPos2;
        const offset = [];
        const outOfBoundRB = viewp1.canvasToWorld([409, 500]);
        console.log('out of bound right bottom', outOfBoundRB);

        const outOfBoundLT = viewp1.canvasToWorld([0, 0]);
        console.log('out of bound left top', outOfBoundLT);

        elementView1.addEventListener('click', (evt) => {
            if (firstClick === false) {
                const rect = elementView1.getBoundingClientRect();
                canvasRefPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                worldRefPos1 = viewp1.canvasToWorld(canvasRefPos1);
                console.log('Coor ref viewport 1 :', worldRefPos1);
                sync1.innerHTML = 'Synchronized';

                coordWorld1x.innerHTML = worldRefPos1[0].toFixed(2) + ' , ';
                coordWorld1y.innerHTML = worldRefPos1[1].toFixed(2) + ' , ';
                coordWorld1z.innerHTML = worldRefPos1[2].toFixed(2);

                firstClick = true;
            }
        })

        elementView2.addEventListener('click', (evt) => {
            if (secondClick === false && firstClick === true) {
                const rect = elementView2.getBoundingClientRect();
                canvasRefPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                worldRefPos2 = viewp2.canvasToWorld(canvasRefPos2);
                console.log('Coor ref viewport 2 :', worldRefPos2);
                sync2.innerHTML = 'Synchronized';

                coordWorld2x.innerHTML = worldRefPos2[0].toFixed(2) + ' , ';
                coordWorld2y.innerHTML = worldRefPos2[1].toFixed(2) + ' , ';
                coordWorld2z.innerHTML = worldRefPos2[2].toFixed(2);

                offset[0] = worldRefPos2[0] - worldRefPos1[0];
                offset[1] = worldRefPos2[1] - worldRefPos1[1];
                offset[2] = worldRefPos2[2] - worldRefPos1[2];
                console.log('offset entre les viewports :', offset);
                secondClick = true;
            }
        })

        elementView1.addEventListener('mousedown', (evt) => {
            if (secondClick === true) {
                const rect = elementView1.getBoundingClientRect();

                const canvasPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                const worldPos1 = viewp1.canvasToWorld(canvasPos1);

                coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
                coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                coordWorld1z.innerHTML = worldPos1[2].toFixed(2);

                const worldPos2 = [worldPos1[0] + offset[0], worldPos1[1] + offset[1], parseInt(coordWorld2z.innerHTML)];
                const canvasPos2 = viewp1.worldToCanvas(worldPos1);

                coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
                coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
                coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
                instanceTG2._jump(element2, worldPos2);

                isClicked = true;
            }
        })

        elementView1.addEventListener('mouseup', () => {
            isClicked = false;
        })

        elementView2.addEventListener('mousedown', (evt) => {
            if (secondClick === true) {
                const rect = elementView2.getBoundingClientRect();

                const canvasPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                const worldPos2 = viewp2.canvasToWorld(canvasPos2);

                coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
                coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
                coordWorld2z.innerHTML = worldPos2[2].toFixed(2);

                const worldPos1 = [worldPos2[0] - offset[0], worldPos2[1] - offset[1], worldPos2[2] - offset[2]];
                const canvasPos1 = viewp1.worldToCanvas(worldPos1);

                coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
                coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                coordWorld1z.innerHTML = worldPos1[2].toFixed(2);
                instanceTG1._jump(element1, worldPos1);

                isClicked = true;
            }
        })

        elementView2.addEventListener('mouseup', () => {
            isClicked = false;
        })


        elementView1.addEventListener('mousemove', (evt) => {
            if (isClicked === true) {
                const rect = elementView1.getBoundingClientRect();

                const canvasPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                const worldPos1 = viewp1.canvasToWorld(canvasPos1);

                const worldPos2 = [worldPos1[0] + offset[0], worldPos1[1] + offset[1], worldPos1[2] + offset[2]];
                const canvasPos2 = viewp1.worldToCanvas(worldPos1);

                if (worldPos2[0] > outOfBoundRB[0] || worldPos2[1] > outOfBoundRB[1] || worldPos2[0] < outOfBoundLT[0] || worldPos2[1] < outOfBoundLT[1]) {
                    coordWorld2x.innerHTML = 'Out';
                    coordWorld2y.innerHTML = 'Out';
                    coordWorld2z.innerHTML = 'Out';
                } else {
                    coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
                    coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                    coordWorld1z.innerHTML = worldPos1[2].toFixed(2);

                    coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
                    coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
                    coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
                    instanceTG2._jump(element2, worldPos2);
                }
            }
        })

        elementView2.addEventListener('mousemove', (evt) => {
            if (isClicked === true) {
                const rect = elementView2.getBoundingClientRect();

                const canvasPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                const worldPos2 = viewp2.canvasToWorld(canvasPos2);

                const worldPos1 = [worldPos2[0] - offset[0], worldPos2[1] - offset[1], worldPos2[2] - offset[2]];
                const canvasPos1 = viewp1.worldToCanvas(worldPos1);

                if (worldPos1[0] > outOfBoundRB[0] || worldPos1[1] > outOfBoundRB[1] || worldPos1[0] < outOfBoundLT[0] || worldPos1[1] < outOfBoundLT[1]) {
                    coordWorld1x.innerHTML = 'Out';
                    coordWorld1y.innerHTML = 'Out';
                    coordWorld1z.innerHTML = 'Out';
                } else {
                    coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
                    coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
                    coordWorld2z.innerHTML = worldPos2[2].toFixed(2);

                    coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
                    coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                    coordWorld1z.innerHTML = worldPos1[2].toFixed(2);
                    instanceTG1._jump(element1, worldPos1);
                }
            }
        })

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

    }

    return (
        <>
            <h1>Volume viewports with 2 crosshair</h1>
            <button id="crosshair-button" onClick={getCoord}>CrossHair</button>
            <div id="CrossHairUI" style={{ visibility: 'hidden' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', color: 'white', marginRight: '30px', borderWidth: 2, borderColor: 'red', borderStyle: 'solid' }}>
                        <p id='sync1' style={{ marginRight: '10px' }}>Not synchronized </p>
                        <p id='worldC1' style={{ marginRight: '5px' }}>World  : </p>
                        <p id='worldC1_x' style={{ marginRight: '10px' }}></p>
                        <p id='worldC1_y' style={{ marginRight: '10px' }}></p>
                        <p id='worldC1_z' style={{ marginRight: '10px' }}></p>
                    </div>

                    <div style={{ display: 'flex', color: 'white', marginRight: '30px', borderWidth: 2, borderColor: 'yellow', borderStyle: 'solid' }}>
                        <p id='sync2' style={{ marginRight: '10px' }}>Not synchronized </p>
                        <p id='worldC2' style={{ color: 'white', marginRight: '5px' }}>World  : </p>
                        <p id='worldC2_x' style={{ marginRight: '10px' }}></p>
                        <p id='worldC2_y' style={{ marginRight: '10px' }}></p>
                        <p id='worldC2_z' style={{ marginRight: '10px' }}></p>
                    </div>
                </div>
            </div>
            <div id="viewers" style={{ flexDirection: 'column', display: 'flex' }}>
                <ViewerVolumeRoot renderID={renderID1} toolGroupId={toolGID1}></ViewerVolumeRoot>
            </div>
        </>

    )
}