import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default (props) => {

    const baseStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderWidth: 2,
        borderRadius: 2,
        // borderColor: '#eeeeee',
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
        color: '#00000',
        outline: 'none',
        transition: 'border .24s ease-in-out'
    };


    const onDrop = useCallback((acceptedFiles) => {
        const files = []
        acceptedFiles.forEach((file) => {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                // Do whatever you want with the file contents
                const binaryStr = reader.result
            }
            reader.readAsArrayBuffer(file)
            files.push(file)
            // props.set(file);
        })
        props.set(files)

    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    return (
        <div id='container' style={baseStyle}>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
        </div>

    )
}