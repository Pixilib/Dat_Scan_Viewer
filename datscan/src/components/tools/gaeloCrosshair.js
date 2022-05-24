import { getRenderingEngine, utilities as csUtils, VolumeViewport, cache } from "@cornerstonejs/core";
import { CrosshairsTool, ToolGroupManager, Enums as CsToolEnums } from "@cornerstonejs/tools";

export default ({ renderingEngineId1, renderingEngineId2, viewportId1, viewportId2 }) => {

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
        document.getElementById('CrossHairUI').style = "visibility: 'visible'";
        let viewPCenter = [];
        const elementView1 = document.getElementById('view1');
        const elementView2 = document.getElementById('view2');

        const elementCanvas1 = document.getElementById('canvasC1');
        const coordWorld1x = document.getElementById('worldC1_x')
        const coordWorld1y = document.getElementById('worldC1_y')
        const coordWorld1z = document.getElementById('worldC1_z')
        const sync1 = document.getElementById('sync1');

        const elementCanvas2 = document.getElementById('canvasC2');
        const coordWorld2x = document.getElementById('worldC2_x')
        const coordWorld2y = document.getElementById('worldC2_y')
        const coordWorld2z = document.getElementById('worldC2_z')
        const sync2 = document.getElementById('sync2');


        const renderingEngine1 = getRenderingEngine(renderingEngineId1);
        const renderingEngine2 = getRenderingEngine(renderingEngineId2)
        const viewp1 = renderingEngine1.getViewport(viewportId1);
        const viewp2 = renderingEngine2.getViewport(viewportId2);

        const viewp2Data = viewp2.getImageData();
        viewPCenter = viewp2Data['imageData'].getCenter();

        // const canvasPos1 = viewp1.worldToCanvas(viewPCenter);
        // elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
        // coordWorld1x.innerHTML = viewPCenter[0].toFixed(2) + ' , ';
        // coordWorld1y.innerHTML = viewPCenter[1].toFixed(2) + ' , ';
        // coordWorld1z.innerHTML = viewPCenter[2].toFixed(2);

        // const canvasPos2 = viewp2.worldToCanvas(viewPCenter);
        // elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
        // coordWorld2x.innerHTML = viewPCenter[0].toFixed(2) + ' , ';
        // coordWorld2y.innerHTML = viewPCenter[1].toFixed(2) + ' , ';
        // coordWorld2z.innerHTML = viewPCenter[2].toFixed(2);


        let isClicked = false;
        let firstClick = false;
        let secondClick = false;

        let refPos1;
        let refPos2;
        const offset = [];

        elementView1.addEventListener('click', (evt) => {
            if (firstClick === false) {
                const rect = elementView1.getBoundingClientRect();
                refPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                console.log('Coor ref viewport 1 :', refPos1);
                sync1.innerHTML = 'Synchronized';
                firstClick = true;
            }
        })

        elementView2.addEventListener('click', (evt) => {
            if (secondClick === false && firstClick === true) {
                const rect = elementView2.getBoundingClientRect();
                refPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
                console.log('Coor ref viewport 2 :', refPos2);
                sync2.innerHTML = 'Synchronized';
                offset[0] = refPos2[0] - refPos1[0];
                offset[1] = refPos2[1] - refPos1[1];
                console.log('offset entre les viewports :', offset);
                secondClick = true;
            }
        })

        // elementView1.addEventListener('mousedown', (evt) => {
        //     const rect = elementView1.getBoundingClientRect();

        //     const canvasPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
        //     const worldPos1 = viewp1.canvasToWorld(canvasPos1);

        //     elementCanvas1.innerHTML = 'Canvas : ' + canvasPos1[0] + ' , ' + canvasPos1[1];
        //     coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
        //     coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
        //     coordWorld1z.innerHTML = worldPos1[2].toFixed(2);

        //     const worldPos2 = [worldPos1[0], worldPos1[1], parseInt(coordWorld2z.innerHTML)];
        //     const canvasPos2 = viewp1.worldToCanvas(worldPos1);

        //     elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
        //     coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
        //     coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
        //     coordWorld2z.innerHTML = worldPos2[2].toFixed(2);
        //     isClicked = true;
        // })

        // elementView1.addEventListener('mouseup', () => {
        //     isClicked = false;
        // })

        // elementView2.addEventListener('mousedown', (evt) => {
        //     const rect = elementView2.getBoundingClientRect();

        //     const canvasPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
        //     const worldPos2 = viewp2.canvasToWorld(canvasPos2);

        //     elementCanvas2.innerHTML = 'Canvas : ' + canvasPos2[0] + ' , ' + canvasPos2[1];
        //     coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
        //     coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
        //     coordWorld2z.innerHTML = worldPos2[2].toFixed(2);

        //     const worldPos1 = [parseInt(coordWorld1x.innerHTML), worldPos2[1], worldPos2[2]];
        //     const canvasPos1 = viewp1.worldToCanvas(worldPos1);

        //     elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
        //     coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
        //     coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
        //     coordWorld1z.innerHTML = worldPos1[2].toFixed(2);

        //     isClicked = true;
        // })

        // elementView2.addEventListener('mouseup', () => {
        //     isClicked = false;
        // })


        // elementView1.addEventListener('mousemove', (evt) => {
        //     if (isClicked === true) {
        //         const rect = elementView1.getBoundingClientRect();

        //         const canvasPos1 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
        //         const worldPos1 = viewp1.canvasToWorld(canvasPos1);

        //         elementCanvas1.innerHTML = 'Canvas : ' + canvasPos1[0] + ' , ' + canvasPos1[1];
        //         coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
        //         coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
        //         coordWorld1z.innerHTML = worldPos1[2].toFixed(2);

        //         const worldPos2 = [worldPos1[0], worldPos1[1], parseInt(coordWorld2z.innerHTML)];
        //         const canvasPos2 = viewp1.worldToCanvas(worldPos1);

        //         elementCanvas2.innerHTML = 'Canvas : ' + Math.trunc(canvasPos2[0]) + ' , ' + Math.trunc(canvasPos2[1]);
        //         coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
        //         coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
        //         coordWorld2z.innerHTML = worldPos2[2].toFixed(2);

        //     }
        // })

        // elementView2.addEventListener('mousemove', (evt) => {
        //     if (isClicked === true) {
        //         const rect = elementView2.getBoundingClientRect();

        //         const canvasPos2 = [Math.floor(evt.clientX - rect.left), Math.floor(evt.clientY - rect.top)];
        //         const worldPos2 = viewp2.canvasToWorld(canvasPos2);

        //         elementCanvas2.innerHTML = 'Canvas : ' + canvasPos2[0] + ' , ' + canvasPos2[1];
        //         coordWorld2x.innerHTML = worldPos2[0].toFixed(2) + ' , ';
        //         coordWorld2y.innerHTML = worldPos2[1].toFixed(2) + ' , ';
        //         coordWorld2z.innerHTML = worldPos2[2].toFixed(2);

        //         const worldPos1 = [parseInt(coordWorld1x.innerHTML), worldPos2[1], parseInt(coordWorld1z.innerHTML)];
        //         const canvasPos1 = viewp1.worldToCanvas(worldPos1);

        //         elementCanvas1.innerHTML = 'Canvas : ' + Math.trunc(canvasPos1[0]) + ' , ' + Math.trunc(canvasPos1[1]);
        //         coordWorld1x.innerHTML = worldPos1[0].toFixed(2) + ' , ';
        //         coordWorld1y.innerHTML = worldPos1[1].toFixed(2) + ' , ';
        //         coordWorld1z.innerHTML = worldPos1[2].toFixed(2);
        //     }
        // })

    }

    return (
        <>
            <button id="crosshair-button" onClick={getCoord}>CrossHair</button>
            <div id="CrossHairUI" style={{ visibility: 'hidden' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', color: 'white', marginRight: '30px', borderWidth: 2, borderColor: 'red', borderStyle: 'solid' }}>
                        <p id='sync1' style={{ marginRight: '10px' }}>Not synchronized </p>
                        <p id='canvasC1' style={{ marginRight: '10px' }}>Canvas : </p>
                        <p id='worldC1' style={{ marginRight: '5px' }}>World  : </p>
                        <p id='worldC1_x' style={{ marginRight: '10px' }}></p>
                        <p id='worldC1_y' style={{ marginRight: '10px' }}></p>
                        <p id='worldC1_z' style={{ marginRight: '10px' }}></p>
                    </div>

                    <div style={{ display: 'flex', color: 'white', marginRight: '30px', borderWidth: 2, borderColor: 'yellow', borderStyle: 'solid' }}>
                        <p id='sync2' style={{ marginRight: '10px' }}>Not synchronized </p>
                        <p id='canvasC2' style={{ color: 'white', marginRight: '10px' }}>Canvas : </p>
                        <p id='worldC2' style={{ color: 'white', marginRight: '5px' }}>World  : </p>
                        <p id='worldC2_x' style={{ marginRight: '10px' }}></p>
                        <p id='worldC2_y' style={{ marginRight: '10px' }}></p>
                        <p id='worldC2_z' style={{ marginRight: '10px' }}></p>
                    </div>
                </div>
            </div>
        </>
    )
}