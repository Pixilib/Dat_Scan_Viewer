import { init, RenderingEngine, Enums, getRenderingEngine } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Drop from './DropZone';
import NexImageButton from './tools/NexImageButton';
import FlipHorizontalButton from './tools/FlipHorizontalButton';
import FlipVerticalButton from './tools/FlipVerticalButton';
import PreviousImageButton from './tools/PreviousImageButton';
import ResetButton from './tools/ResetButton';

export default () => {

    const [file, setfile] = useState([]);
    const renderingEngineId = 'myEngine';
    const viewportIdentifiant = 'CT_STACK'

    const buildImageId = (file) => {
        setfile(file)
    }


    useEffect(() => {

        const run = async () => {
            //Configuration et initialisation des libraries

            await init();
            initCornerstoneWADOImageLoader();
            const divAff = document.getElementById("viewer");

            divAff.style.width = "500px"
            divAff.style.height = "500px"

            let imageIdDefault = cornerstoneWADOImageLoader.wadouri.fileManager.add(file[0]);
            const imageId = imageIdDefault + "?frame=" + 0
            console.log(imageId)

            const renderingEngine = new RenderingEngine(renderingEngineId)


            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: Enums.ViewportType.STACK,
            };

            renderingEngine.enableElement(viewportInput);

            const viewport = renderingEngine.getViewport(viewportIdentifiant);

            const stack = [imageId]
            viewport.setStack(stack)

            viewport.render()
        }
        if (file.length > 0) {
            document.getElementById('toolbar').hidden = false
            run()
        } else {
            document.getElementById('toolbar').hidden = true
        }

    }, [file])


    return (
        <>
            <h1>DatScan Viewer</h1>
            <Drop set={buildImageId}></Drop>
            <div id='toolbar'>
                <PreviousImageButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></PreviousImageButton>
                <NexImageButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></NexImageButton>
                <FlipHorizontalButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></FlipHorizontalButton>
                <FlipVerticalButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></FlipVerticalButton>
                <ResetButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></ResetButton>

            </div>
            <div id="viewer"></div>

        </>
    )

}