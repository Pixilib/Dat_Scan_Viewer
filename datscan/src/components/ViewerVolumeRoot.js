import React, { useEffect, useState } from 'react';
import { CONSTANTS, cache, init, RenderingEngine, volumeLoader, Enums, setVolumesForViewports, getRenderingEngine } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import { cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';
import { makeVolumeMetadata } from '@cornerstonejs/streaming-image-volume-loader/dist/esm/helpers';
import { addTool, CrosshairsTool, ToolGroupManager, StackScrollMouseWheelTool, ZoomTool, init as ToolInit, Enums as csEnums } from '@cornerstonejs/tools';
import Drop from './DropZone';


export default ({ renderID, toolGroupId }) => {

    const [files, setFiles] = useState([]);
    const [files2, setFiles2] = useState([]);
    let volumeId = 'cornerStreamingImageVolume: myVolume';
    const viewPIDS = ['Viewport1', 'Viewport12', 'Viewport13', 'Viewport2', 'Viewport22', 'Viewport23'];
    const views = ['view1', 'view12', 'view13', 'view2', 'view22', 'view23'];

    const buildImageId = (files) => {
        setFiles(files)

    }

    const buildImageId2 = (files) => {
        setFiles2(files)

    }

    const createAndAddTool = (toolGID, viewPIDS, renderID) => {

        //Définition du groupe qui va contenir tout les outils
        const toolGroup = ToolGroupManager.createToolGroup(toolGID);

        for (let viewPID of viewPIDS) {
            //Ajout des outils au viewport 
            toolGroup.addViewport(viewPID, renderID);
        }
        // Tools
        toolGroup.addTool(ZoomTool.toolName)
        toolGroup.addTool(StackScrollMouseWheelTool.toolName);

        //De base sur la molette
        toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
        toolGroup.setToolActive(ZoomTool.toolName, {
            bindings: [{ mouseButton: csEnums.MouseBindings.Secondary }],
        });
    }

    const createViewportRow = (views, viewPIDs) => {
        const element1 = document.getElementById(views[0]);
        element1.oncontextmenu = (e) => e.preventDefault();

        const element2 = document.getElementById(views[1]);
        element2.oncontextmenu = (e) => e.preventDefault();

        const element3 = document.getElementById(views[2]);
        element3.oncontextmenu = (e) => e.preventDefault();

        const element21 = document.getElementById(views[3]);
        element1.oncontextmenu = (e) => e.preventDefault();

        const element22 = document.getElementById(views[4]);
        element2.oncontextmenu = (e) => e.preventDefault();

        const element23 = document.getElementById(views[5]);
        element3.oncontextmenu = (e) => e.preventDefault();

        const viewportInput = [{
            viewportId: viewPIDs[0],
            element: element1,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: {
                orientation: CONSTANTS.ORIENTATION.AXIAL,
                background: [0, 0, 0],
            },
        },
        {
            viewportId: viewPIDs[1],
            element: element2,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: {
                orientation: CONSTANTS.ORIENTATION.SAGITTAL,
                background: [0, 0, 0],
            },
        },
        {
            viewportId: viewPIDs[2],
            element: element3,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: {
                orientation: CONSTANTS.ORIENTATION.CORONAL,
                background: [0, 0, 0],
            },
        }, {
            viewportId: viewPIDs[3],
            element: element21,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: {
                orientation: CONSTANTS.ORIENTATION.AXIAL,
                background: [0, 0, 0],
            },
        },
        {
            viewportId: viewPIDs[4],
            element: element22,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: {
                orientation: CONSTANTS.ORIENTATION.SAGITTAL,
                background: [0, 0, 0],
            },
        },
        {
            viewportId: viewPIDs[5],
            element: element23,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            defaultOptions: {
                orientation: CONSTANTS.ORIENTATION.CORONAL,
                background: [0, 0, 0],
            },
        }];

        return (viewportInput);

    }

    useEffect(() => {

        const run = async () => {
            //We verify if the first row of viewports has been created
            if (ToolGroupManager.getToolGroup('ToolGroupID1') != null) {

                const viewportIDs = ['Viewport2', 'Viewport22', 'Viewport23']
                //Loading the images from the dropbox
                let imageIds = []
                files.forEach(file => {
                    let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                    imageIds.push(imageId)
                });

                for (let imageId of imageIds) {
                    const firstImage = cornerstoneWADOImageLoader.wadouri.loadImage(imageId)
                    const fImage = await firstImage["promise"]
                }

                const volumeMetadata = makeVolumeMetadata(imageIds);

                volumeId = 'cornerStreamingImageVolume: myVolumetwo';

                const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                    imageIds
                });

                const renderingEngine = getRenderingEngine(renderID);

                volume.load();

                await setVolumesForViewports(renderingEngine, [
                    {
                        volumeId,
                        // callback: setCtTransferFunctionForVolumeActor,
                        blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                    },
                ],
                    viewportIDs
                );

                //Creating the toolgroup and add the zoom / stackscroll
                createAndAddTool('ToolGroupID2', viewportIDs, renderID);

                renderingEngine.renderViewports(viewPIDS);

            } else {
                //Initialisation of libraries
                initCornerstoneWADOImageLoader();
                await init();
                await ToolInit();

                //Adding tools to the library
                addTool(ZoomTool);
                addTool(StackScrollMouseWheelTool);
                addTool(CrosshairsTool);

                const viewportIDs = ['Viewport1', 'Viewport12', 'Viewport13']

                volumeLoader.registerVolumeLoader('cornerStreamingImageVolume', cornerstoneStreamingImageVolumeLoader);

                //Loading the images from the dropbox
                let imageIds = []
                files.forEach(file => {
                    let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                    imageIds.push(imageId)
                });

                for (let imageId of imageIds) {
                    const firstImage = cornerstoneWADOImageLoader.wadouri.loadImage(imageId)
                    const fImage = await firstImage["promise"]
                    console.log(fImage);
                }

                const volumeMetadata = makeVolumeMetadata(imageIds);

                const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                    imageIds
                });


                const renderingEngine = new RenderingEngine(renderID);

                const viewportInput = createViewportRow(views, viewPIDS);

                renderingEngine.setViewports(viewportInput);

                volume.load();

                await setVolumesForViewports(renderingEngine, [
                    {
                        volumeId,
                        // callback: setCtTransferFunctionForVolumeActor,
                        blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                    },
                ],
                    viewportIDs
                );

                //Creating the toolgroup and add the zoom / stackscroll
                createAndAddTool(toolGroupId, viewportIDs, renderID);

                renderingEngine.renderViewports(viewPIDS);
            }

        }
        if (files.length > 0) {
            run();
        }
    }, [files])

    return (
        <>
            <div style={{ flexDirection: 'column' }}>
                <Drop set={buildImageId}></Drop>
                <div id='content'>
                    <div id='DivView' style={{ display: 'flex', flexDirection: 'row' }}>
                        <div id='view1' style={{ width: '409px', height: '500px' }}></div>
                        <div id='view12' style={{ width: '409px', height: '500px' }}></div>
                        <div id='view13' style={{ width: '409px', height: '500px' }}></div>
                    </div>
                </div>

                <div id='content'>
                    <div id='DivView2' style={{ display: 'flex', flexDirection: 'row' }}>
                        <div id='view2' style={{ width: '409px', height: '500px' }}></div>
                        <div id='view22' style={{ width: '409px', height: '500px' }}></div>
                        <div id='view23' style={{ width: '409px', height: '500px' }}></div>
                    </div>
                </div>
            </div>


        </>
    )
}