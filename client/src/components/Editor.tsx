import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

let UploadedImgUrl

class MyUploadAdapter {
  loader : any
  constructor(loader) {
    this.loader = loader;
  }
  // Starts the upload process.
  upload() {
    return this.loader.file.then(
      file =>
        new Promise( async (resolve, reject) => {
        const formData = new FormData()
        formData.append('file',file)
         const response = await axios.post<any>(`/posts/uploads`,formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        UploadedImgUrl = response.data.image
          resolve({
            default: response.data.image
          });
        })
    );
  }
}

export default function Editor(props) {
  const editorRef = useRef()
  const [ editorLoaded, setEditorLoaded ] = useState( false )
  const { CKEditor, ClassicEditor} : any | undefined = editorRef.current || {}
  const [postImages, setPostImages] = useState([])

    useEffect( () => {
      editorRef.current = {
        CKEditor: require( '@ckeditor/ckeditor5-react' ).CKEditor, //Added .CKEditor
        ClassicEditor: require( '@ckeditor/ckeditor5-build-classic' ),
        } as any | undefined
        
        setEditorLoaded( true )
        
      }, [] );

      useEffect(() => {
        if(UploadedImgUrl !== undefined){
          let img = UploadedImgUrl.split('/').pop()
          setPostImages(arr => [...arr, img])
        }
      }, [UploadedImgUrl])
      
      if(editorLoaded){
        ClassicEditor.defaultConfig = {
          toolbar: [
            'heading',
            'bold',
            'italic',
            'blockQuote',
            'link',
            'selectAll',
            'undo',
            'redo',
            'uploadImage',
            'mediaEmbed',
            'imageStyle:full',
            'imageStyle:side',
          ],
          mediaEmbed: {
            previewsInData: true
          }
        }
      }
    //console.log(JSON.stringify(postImages))
    return (
    <>
      {editorLoaded ? <CKEditor
          editor={ ClassicEditor }
          data={props.value}
          onReady={ editor => {
            //console.log( Array.from( editor.ui.componentFactory.names() ) );
            editor.plugins.get("FileRepository").createUploadAdapter = loader => ( new MyUploadAdapter(loader) )

          } }
          onChange={ (event, editor ) => {
            const data = editor.getData()
            props.onChange(data)
          } }
      /> : <p>Loading...</p>}
    </>
    );
}
