import * as cornerstone from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect } from 'react';


export default () => {

    useEffect(() => {
        const run = async () => {
            //Configuration et initialisation des libraries
            await cornerstone.init()
            initCornerstoneWADOImageLoader()


            const divAff = document.getElementById("viewer")
            divAff.style.width = "500px"
            divAff.style.height = "500px"

            // this UI is only built for a single file so just dump the first one
            const fic = new File([''], './images/MR000000.dcm')
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
            // const stack = cornerstone.imageLoader.loadAndCacheImage(imageId);
            console.log(stack)

            viewport.setStack(stack)

            viewport.render()
        }
        run()
    }, [])


    return (
        <>
            <div id="viewer"></div>
        </>
    )

}