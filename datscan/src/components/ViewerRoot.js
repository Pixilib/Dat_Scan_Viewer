import * as cornerstone from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Basic from './DropZone';

export default () => {

    const [file, setfile] = useState(0);

    useEffect(() => {
        const run = async () => {
            //Configuration et initialisation des libraries

            await cornerstone.init();
            initCornerstoneWADOImageLoader();

            const divAff = document.getElementById("viewer");
            divAff.style.width = "500px"
            divAff.style.height = "500px"

            const fic = file;
            const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(fic);

            const renderingEngineId = 'myEngine';
            const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId)


            const viewportIdentifiant = 'CT_STACK'
            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: cornerstone.Enums.ViewportType.STACK,
            };

            renderingEngine.enableElement(viewportInput);

            const viewport = renderingEngine.getViewport(viewportIdentifiant);

            const stack = [imageId]
            viewport.setStack(stack)

            viewport.render()
        }
        run()
    }, [file])


    return (
        <>
            <Basic count={file} set={setfile}></Basic>
            <div id="viewer"></div>
        </>
    )

}