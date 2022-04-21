import { getRenderingEngine, utilities as csUtils, VolumeViewport, cache } from "@cornerstonejs/core";
import { CrosshairsTool, ToolGroupManager } from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/dist/esm/enums";

export default ({ renderingEngineId, viewportId1, viewportId2, viewportId3, toolGroupId, volumeId }) => {

    function getValue(volume, worldPos) {
        const { dimensions, scalarData, imageData } = volume;

        const index = imageData.worldToIndex(worldPos);

        index[0] = Math.floor(index[0]);
        index[1] = Math.floor(index[1]);
        index[2] = Math.floor(index[2]);

        if (!csUtils.indexWithinDimensions(index, dimensions)) {
            return;
        }

        const yMultiple = dimensions[0];
        const zMultiple = dimensions[0] * dimensions[1];

        const value =
            scalarData[index[2] * zMultiple + index[1] * yMultiple + index[0]];

        return value;
    }

    const getCoord = () => {
        let viewPCenter = [];
        const elementView1 = document.getElementById('view1');
        const elementView2 = document.getElementById('view2');
        const elementView3 = document.getElementById('view3');

        const elementCanvas1 = document.getElementById('canvasC1');
        const coordWorld1x = document.getElementById('worldC1_x')
        const coordWorld1y = document.getElementById('worldC1_y')
        const coordWorld1z = document.getElementById('worldC1_z')
        const valueCT1 = document.getElementById('valueCT1');

        const elementCanvas2 = document.getElementById('canvasC2');
        const coordWorld2x = document.getElementById('worldC2_x')
        const coordWorld2y = document.getElementById('worldC2_y')
        const coordWorld2z = document.getElementById('worldC2_z')
        const valueCT2 = document.getElementById('valueCT2');

        const elementCanvas3 = document.getElementById('canvasC3');
        const coordWorld3x = document.getElementById('worldC3_x')
        const coordWorld3y = document.getElementById('worldC3_y')
        const coordWorld3z = document.getElementById('worldC3_z')
        const valueCT3 = document.getElementById('valueCT3');

        const ctVolume = cache.getVolume(volumeId)

        const renderingEngine = getRenderingEngine(renderingEngineId)
        const viewp1 = renderingEngine.getViewport(viewportId1);
        const viewp2 = renderingEngine.getViewport(viewportId2);
        const viewp3 = renderingEngine.getViewport(viewportId3);

        const viewp2Data = viewp2.getImageData();
        viewPCenter = viewp2Data['imageData'].getCenter();

        const canvasPos1 = viewp1.worldToCanvas(viewPCenter);
        elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
        coordWorld1x.innerHTML = viewPCenter[0].toFixed(2) + ' , ';
        coordWorld1y.innerHTML = viewPCenter[1].toFixed(2) + ' , ';
        coordWorld1z.innerHTML = viewPCenter[2].toFixed(2);

        const canvasPos2 = viewp2.worldToCanvas(viewPCenter);
        elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
        coordWorld2x.innerHTML = viewPCenter[0].toFixed(2) + ' , ';
        coordWorld2y.innerHTML = viewPCenter[1].toFixed(2) + ' , ';
        coordWorld2z.innerHTML = viewPCenter[2].toFixed(2);

        const canvasPos3 = viewp3.worldToCanvas(viewPCenter);
        elementCanvas3.innerHTML = 'Canvas : ' + Math.trunc(canvasPos3[0]) + ' , ' + Math.trunc(canvasPos3[1]);
        coordWorld3x.innerHTML = viewPCenter[0].toFixed(2) + ' , ';
        coordWorld3y.innerHTML = viewPCenter[1].toFixed(2) + ' , ';
        coordWorld3z.innerHTML = viewPCenter[2].toFixed(2);

        let isClicked = false;
        elementView1.addEventListener('mousedown', (evt) => {
            const rect = elementView1.getBoundingClientRect();

            const canvasPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
            const worldPos1 = viewp1.canvasToWorld(canvasPos1);

            elementCanvas1.innerHTML = 'Canvas : ' + canvasPos1[0] + ' , ' + canvasPos1[1];
            coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
            coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
            coordWorld1z.innerHTML = worldPos1[2].toFixed(2);
            valueCT1.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos1);

            const worldPos2 = [worldPos1[0], worldPos1[1], parseInt(coordWorld2z.innerHTML)];
            const canvasPos2 = viewp1.worldToCanvas(worldPos1);

            elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
            coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
            coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
            coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
            valueCT2.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos2);

            const worldPos3 = [worldPos1[0], worldPos1[1], parseInt(coordWorld3z.innerHTML)];
            const canvasPos3 = viewp3.worldToCanvas(worldPos3);

            elementCanvas3.innerHTML = 'Canvas : ' + Math.trunc(canvasPos3[0]) + ' , ' + Math.trunc(canvasPos3[0]);
            coordWorld3x.innerHTML = worldPos3[0].toFixed(2) + ' , ';
            coordWorld3y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
            coordWorld3z.innerHTML = worldPos3[2].toFixed(2);
            valueCT3.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos3);
            isClicked = true;
        })

        elementView1.addEventListener('mouseup', () => {
            isClicked = false;
        })

        elementView2.addEventListener('mousedown', (evt) => {
            const rect = elementView2.getBoundingClientRect();

            const canvasPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
            const worldPos2 = viewp2.canvasToWorld(canvasPos2);

            elementCanvas2.innerHTML = 'Canvas : ' + canvasPos2[0] + ' , ' + canvasPos2[1];
            coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
            coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
            coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
            valueCT2.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos2);

            const worldPos1 = [parseInt(coordWorld1x.innerHTML), worldPos2[1], worldPos2[2]];
            const canvasPos1 = viewp1.worldToCanvas(worldPos1);

            elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
            coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
            coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
            coordWorld1z.innerHTML = worldPos1[2].toFixed(2);
            valueCT1.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos1);

            const worldPos3 = [parseInt(coordWorld3x.innerHTML), worldPos2[1], worldPos2[2]];
            const canvasPos3 = viewp3.worldToCanvas(worldPos3);

            elementCanvas3.innerHTML = 'Canvas : ' + Math.trunc(canvasPos3[0]) + ' , ' + Math.trunc(canvasPos3[1]);
            coordWorld3x.innerHTML = worldPos3[0].toFixed(2) + ' , ';
            coordWorld3y.innerHTML = worldPos3[1].toFixed(2) + ' , ';
            coordWorld3z.innerHTML = worldPos3[2].toFixed(2);
            valueCT3.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos3);
            isClicked = true;
        })

        elementView2.addEventListener('mouseup', () => {
            isClicked = false;
        })

        elementView3.addEventListener('mousedown', (evt) => {
            const rect = elementView3.getBoundingClientRect();

            const canvasPos3 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
            const worldPos3 = viewp3.canvasToWorld(canvasPos3);

            elementCanvas3.innerHTML = 'Canvas : ' + canvasPos3[0] + ' , ' + canvasPos3[1];
            coordWorld3x.innerHTML = worldPos3[0].toFixed(2) + ' , ';
            coordWorld3y.innerHTML = worldPos3[1].toFixed(2) + ' , ';
            coordWorld3z.innerHTML = worldPos3[2].toFixed(2);
            valueCT3.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos3);

            const worldPos1 = [worldPos3[0], worldPos3[1], parseInt(coordWorld3z.innerHTML)];
            const canvasPos1 = viewp1.worldToCanvas(worldPos1);

            elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
            coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
            coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
            coordWorld1z.innerHTML = worldPos3[2].toFixed(2);
            valueCT1.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos1);

            const worldPos2 = [worldPos3[0], parseInt(coordWorld2y.innerHTML), parseInt(coordWorld2z.innerHTML)];
            const canvasPos2 = viewp1.worldToCanvas(worldPos1);

            elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
            coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
            coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
            coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
            valueCT2.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos2);
            isClicked = true;
        })

        elementView3.addEventListener('mouseup', () => {
            isClicked = false;
        })

        elementView1.addEventListener('mousemove', (evt) => {
            if (isClicked === true) {
                const rect = elementView1.getBoundingClientRect();

                const canvasPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                const worldPos1 = viewp1.canvasToWorld(canvasPos1);

                elementCanvas1.innerHTML = 'Canvas : ' + canvasPos1[0] + ' , ' + canvasPos1[1];
                coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
                coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                coordWorld1z.innerHTML = worldPos1[2].toFixed(2);
                valueCT1.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos1);

                const worldPos2 = [worldPos1[0], worldPos1[1], parseInt(coordWorld2z.innerHTML)];
                const canvasPos2 = viewp1.worldToCanvas(worldPos1);

                elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
                coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
                coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
                coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
                valueCT2.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos2);

                const worldPos3 = [worldPos1[0], worldPos1[1], parseInt(coordWorld3z.innerHTML)];
                const canvasPos3 = viewp3.worldToCanvas(worldPos3);

                elementCanvas3.innerHTML = 'Canvas : ' + Math.trunc(canvasPos3[0]) + ' , ' + Math.trunc(canvasPos3[1]);
                coordWorld3x.innerHTML = worldPos3[0].toFixed(2) + ' , ';
                coordWorld3y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                coordWorld3z.innerHTML = worldPos3[2].toFixed(2);
                valueCT3.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos3);
            }
        })

        elementView2.addEventListener('mousemove', (evt) => {
            if (isClicked === true) {
                const rect = elementView2.getBoundingClientRect();

                const canvasPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                const worldPos2 = viewp2.canvasToWorld(canvasPos2);

                elementCanvas2.innerHTML = 'Canvas : ' + canvasPos2[0] + ' , ' + canvasPos2[1];
                coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
                coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
                coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
                valueCT2.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos2);

                const worldPos1 = [parseInt(coordWorld1x.innerHTML), worldPos2[1], parseInt(coordWorld1z.innerHTML)];
                const canvasPos1 = viewp1.worldToCanvas(worldPos1);

                elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
                coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
                coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                coordWorld1z.innerHTML = worldPos1[2].toFixed(2);
                valueCT1.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos1);

                const worldPos3 = [parseInt(coordWorld3x.innerHTML), parseInt(coordWorld3y.innerHTML), worldPos2[2]];
                const canvasPos3 = viewp3.worldToCanvas(worldPos3);

                elementCanvas3.innerHTML = 'Canvas : ' + Math.trunc(canvasPos3[0]) + ' , ' + Math.trunc(canvasPos3[1]);
                coordWorld3x.innerHTML = worldPos3[0].toFixed(2) + ' , ';
                coordWorld3y.innerHTML = worldPos3[1].toFixed(2) + ' , ';
                coordWorld3z.innerHTML = worldPos3[2].toFixed(2);
                valueCT3.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos3);
            }
        })

        elementView3.addEventListener('mousemove', (evt) => {
            if (isClicked === true) {
                const rect = elementView3.getBoundingClientRect();

                const canvasPos3 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                const worldPos3 = viewp3.canvasToWorld(canvasPos3);

                elementCanvas3.innerHTML = 'Canvas : ' + canvasPos3[0] + ' , ' + canvasPos3[1];
                coordWorld3x.innerHTML = worldPos3[0].toFixed(2) + ' , ';
                coordWorld3y.innerHTML = worldPos3[1].toFixed(2) + ' , ';
                coordWorld3z.innerHTML = worldPos3[2].toFixed(2);
                valueCT3.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos3);

                const worldPos1 = [worldPos3[0], worldPos3[1], parseInt(coordWorld3z.innerHTML)];
                const canvasPos1 = viewp1.worldToCanvas(worldPos1);

                elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
                coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
                coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
                coordWorld1z.innerHTML = worldPos3[2].toFixed(2);
                valueCT1.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos1);

                const worldPos2 = [worldPos3[0], parseInt(coordWorld2y.innerHTML), parseInt(coordWorld2z.innerHTML)];
                const canvasPos2 = viewp1.worldToCanvas(worldPos1);

                elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
                coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
                coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
                coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
                valueCT2.innerHTML = 'CT value : ' + getValue(ctVolume, worldPos2);
            }
        })

        //CrossHair tool
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
        toolGroup.setToolActive(CrosshairsTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Primary }]
        })

        console.log(toolGroup.getToolInstance(CrosshairsTool.toolName));
    }

    return (
        <>
            <button id="crosshair-button" onClick={getCoord}>CrossHair</button>
            <div id="CrossHairUI">
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', color: 'white', marginRight: '30px', borderWidth: 2, borderColor: 'red', borderStyle: 'solid' }}>
                        <p id='canvasC1' style={{ marginRight: '10px' }}>Canvas : </p>
                        <p id='worldC1' style={{ marginRight: '5px' }}>World  : </p>
                        <p id='worldC1_x' style={{ marginRight: '10px' }}></p>
                        <p id='worldC1_y' style={{ marginRight: '10px' }}></p>
                        <p id='worldC1_z' style={{ marginRight: '10px' }}></p>
                        <p id='valueCT1' style={{ marginRight: '10px' }} > CT Value :</p>
                    </div>

                    <div style={{ display: 'flex', color: 'white', marginRight: '30px', borderWidth: 2, borderColor: 'yellow', borderStyle: 'solid' }}>
                        <p id='canvasC2' style={{ color: 'white', marginRight: '10px' }}>Canvas : </p>
                        <p id='worldC2' style={{ color: 'white', marginRight: '5px' }}>World  : </p>
                        <p id='worldC2_x' style={{ marginRight: '10px' }}></p>
                        <p id='worldC2_y' style={{ marginRight: '10px' }}></p>
                        <p id='worldC2_z' style={{ marginRight: '10px' }}></p>
                        <p id='valueCT2' style={{ marginRight: '10px' }} > CT Value :</p>
                    </div>

                    <div style={{ display: 'flex', color: 'white', borderWidth: 2, borderColor: 'green', borderStyle: 'solid' }}>
                        <p id='canvasC3' style={{ color: 'white', marginRight: '10px' }}>Canvas : </p>
                        <p id='worldC3' style={{ color: 'white', marginRight: '5px' }}>World  : </p>
                        <p id='worldC3_x' style={{ marginRight: '10px' }}></p>
                        <p id='worldC3_y' style={{ marginRight: '10px' }}></p>
                        <p id='worldC3_z' style={{ marginRight: '10px' }}></p>
                        <p id='valueCT3' style={{ marginRight: '10px' }} > CT Value :</p>
                    </div>
                </div>
            </div>
        </>
    )
}