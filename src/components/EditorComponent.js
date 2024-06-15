import React, { useState, useRef } from 'react';
import { Editor, EditorState, RichUtils , convertToRaw, convertFromRaw ,Modifier} from 'draft-js';
import 'draft-js/dist/Draft.css';
import './EditorComponent.css';



const EditorComponent = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    return savedContent ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent))) : EditorState.createEmpty();
  });

  const editorRef = useRef(null);



  const handleBeforeInput = (chars) => {

    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = currentContent.getBlockForKey(selection.getStartKey());
    const blockText = block.getText();
    
    const applyStyleAndRemoveSymbol = (symbolLength, styleFunc, styleType) => {
        const newContentState = Modifier.replaceText(
            currentContent,
            selection.merge({
              anchorOffset: 0,
              focusOffset: symbolLength,
            }),
            ''
          );
        let finalEditorState = EditorState.push(editorState, newContentState, 'remove-range');

        const currentStyles = finalEditorState.getCurrentInlineStyle();
        currentStyles.forEach((style) => {
          finalEditorState = RichUtils.toggleInlineStyle(finalEditorState, style);
        });

        const styledEditorState = styleFunc(finalEditorState, styleType);
        setEditorState(styledEditorState);
          return 'handled';
      };

  

    if (blockText + chars === '# ') {
        return applyStyleAndRemoveSymbol(2,RichUtils.toggleBlockType,'header-one')
    }
    if (blockText + chars === '* ') {
        return applyStyleAndRemoveSymbol(2,RichUtils.toggleInlineStyle,'BOLD')
    }
    if (blockText + chars === '** ') {
        return applyStyleAndRemoveSymbol(2,RichUtils.toggleInlineStyle,'RED')
    }
    if (blockText + chars === '*** ') {
        return applyStyleAndRemoveSymbol(3,RichUtils.toggleInlineStyle,'UNDERLINE')
    }
    if (blockText + chars === '``` ') {
        return applyStyleAndRemoveSymbol(3,RichUtils.toggleBlockType,'code-block')
    }
    return 'not-handled';
  };

  
const handleReturn = (e, editorState) => {
    console.log('handle return')
    const currentBlockType = RichUtils.getCurrentBlockType(editorState);
  
    if (currentBlockType === 'code-block') return 'not-handled';
  
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContentState = Modifier.splitBlock(currentContent, selection);
    let resetEditorState = EditorState.push(editorState, newContentState, 'split-block');
  

    resetEditorState = RichUtils.toggleBlockType(resetEditorState, 'unstyled');

    let currentInlineStyles = resetEditorState.getCurrentInlineStyle();
    currentInlineStyles.forEach((style) => {
      resetEditorState = RichUtils.toggleInlineStyle(resetEditorState, style);
    });
  
  
    setEditorState(resetEditorState);
    return 'handled';
  };
  

  const handleSave = () => {
    const content = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(content));
    localStorage.setItem('editorContent', rawContent);
    alert('Content saved to local storage!');
  };

  const focusEditor = () => {
    editorRef.current.focus();
  };


  return (
    <div className="editor-container" onClick={focusEditor}>
      <div className='text-button-container'>
        <h3>Editor by Ravindra Babu Polnedi</h3>
        <button onClick={handleSave}>Save</button>
      </div>
      <div className="editor">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          handleReturn={handleReturn}
          customStyleMap={styleMap}
          ref={editorRef}
        />
      </div>
    </div>
  );
};

const styleMap = {
  RED: {
    color: 'red',
  },
};

export default EditorComponent;



