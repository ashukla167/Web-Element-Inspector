import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

class componentName extends Component {
    constructor(props) {
        super(props);

        this.state = {
            "scenes": Object.keys(props.data.scenes)
        }
        const grid = 6;

        this.getItemStyle = (draggableStyle, isDragging) => ({
            ...draggableStyle,
            // some basic styles to make the items look a bit nicer
            userSelect: 'none',
            padding: grid * 2,
            boxShadow: '0px 1px 1px 0.1px',
          
            // change background colour if dragging
            background: isDragging ? 'lightgreen' : 'white',
          
            // // styles we need to apply on draggables
            
        });

        this.getListStyle = isDraggingOver => ({
            background: isDraggingOver ? 'lightblue' : 'lightblue',
            padding: grid,
            boxShadow: '0px 0px 1px 1px',
            width: 250,
          });

    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({"scenes": Object.keys(nextProps.data.scenes)})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    // a little function to help us with reordering the result
    reorder(list, startIndex, endIndex){
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

    
        return result;
    };

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
          return;
        }
    
        const scenes = this.reorder(
          this.state.scenes,
          result.source.index,
          result.destination.index
        );
        window.outputData.startAt = scenes[0];
        let newScenes = {};
        scenes.forEach((val,i) => {
            newScenes[val] =  window.outputData.scenes[val];
            newScenes[val].next = scenes[i+1]?scenes[i+1]:"";
        });

        window.outputData.scenes = newScenes;
        
        this.setState({
            scenes,
        });
    }
    
    closeMe() {
        let elem = document.getElementById('st-configure-list');
        elem.style.display = 'none';
    }

    render() {
        return (
            <div >
                <div style={{color: "red", cursor: "pointer"}} onClick={this.closeMe}>
                    X
                </div>
                <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
                    <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                        ref={provided.innerRef}
                        style={this.getListStyle(snapshot.isDraggingOver)}
                        >
                        {this.state.scenes.map(item => (
                            <Draggable key={this.props.data.scenes[item].selector} draggableId={this.props.data.scenes[item].selector}>
                            {(provided, snapshot) => (
                                <div style={{marginBottom: 8}}>
                                <div
                                    ref={provided.innerRef}
                                    style={Object.assign({marginBottom: 8},this.getItemStyle(
                                    provided.draggableStyle,
                                    snapshot.isDragging
                                    ))}
                                    {...provided.dragHandleProps}
                                >
                                    {this.props.data.scenes[item].text}
                                </div>
                                {provided.placeholder}
                                </div>
                            )}
                            </Draggable>
                        ))}
                        </div>
                    )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    }
}

componentName.propTypes = {

};

export default componentName;