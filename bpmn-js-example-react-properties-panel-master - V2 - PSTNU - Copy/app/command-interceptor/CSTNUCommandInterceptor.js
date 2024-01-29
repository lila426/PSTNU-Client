import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

class CSTNUCommandInterceptor extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    const activityTypes = ["bpmn:Task", "bpmn:SendTask",
                           "bpmn:ReceiveTask", "bpmn:UserTask", "bpmn:ManualTask",
                           "bpmn:BusinessRuleTask", "bpmn:ServiceTask"];

    const startEventTypes = ["bpmn:StartEvent"];

    const endEventTypes = ["bpmn:EndEvent"];

    const gatewayTypes = ["bpmn:ExclusiveGateway"];

    const connectionTypes = ["bpmn:SequenceFlow"];

    const constraintTypes = ["td:TemporalConstraint"];

    let axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
        }
    };

    //const postURL = 'https://localhost:3333/translationCSTNU';

    this.getCreatePostDataShape = ( context ) => {

      const { shape } = context;

      const { id } = shape;

      const { type } = shape;

      const { x } = shape;

      const { y } = shape;

      let postData;
      postData = {
        
            id: id,
            Obs: null,
            Label: null,
            x: x,
            y: y,
            c: 1
      }

      return postData;

    };

    this.getCreatePostDataConnection = (context) => {

      const { connection } = context;

      const { id } = connection;

      const { type } = connection;

      const { source } = context;

      const { target } = context;

      let postData;

     if(connectionTypes.indexOf(type) !== -1){
       postData = {
         type: type,
         data:{
           id: id,
           Source: source.id,
           Target: target.id,
           Value: 0,
           Type: "normal",
           LabeledValues: {}
         }
       }
     }

     if(constraintTypes.indexOf(type) !== -1){

       console.log(context);


       postData = {
         type: type,
         data:{
           id: id,
           Source: source.id,
           Target: target.id,
           Value: 0,
           Type: "constraint",
           LabeledValues: {}
         }
       }

     }

      return postData;

    };

    this.sendPostData = ( postData, postURL ) => {
      const axios = require('axios');

       axios
         .post(postURL, postData, axiosConfig)
         .then(res => {
           console.log(`statusCode: ${res.status}`);
           console.log(res);
         })
         .catch(error => {
           console.error(error);
         });

    };

    this.updateIds = (context) => {

      if(context.source.type === "td:StartNode"){
        let id = context.source.id;
        if(context.target.type !== "td:EndNode"){
          let newId = context.target.id.concat('_S');
          modeling.updateProperties(context.source, {
            id: newId
          });
        }
      }

      if(context.source.type === "td:EndNode"){
        let id = context.source.id;
        if(context.target.type !== "td:StartNode"){
          let newId = context.target.id.concat('_E');
          modeling.updateProperties(context.source, {
            id: newId
          });
        }
      }

      if(context.target.type === "td:StartNode"){
        let id = context.target.id;
        if(context.source.type !== "td:EndNode"){
          let newId = context.source.id.concat('_S');
          modeling.updateProperties(context.target, {
            id: newId
          });
        }
      }

      if(context.target.type === "td:EndNode"){
        let id = context.target.id;
        if(context.source.type !== "td:StartNode"){
          let newId = context.source.id.concat('_E');
          modeling.updateProperties(context.target, {
            id: newId
          });
        }
      }
    };

    this.postExecuted(["shape.create"], ({ context }) => {

      const { shape } = context;

      const { type } = shape;

      const postData = this.getCreatePostDataShape(context);

      if(activityTypes.includes(type)){

          this.sendPostData(postData, 'http://localhost:3333/translationCSTNU/Activity');

      }

      if(startEventTypes.includes(type)){

          this.sendPostData(postData, 'http://localhost:3333/translationCSTNU/Start');

      }

      if(endEventTypes.includes(type)){

          this.sendPostData(postData, 'http://localhost:3333/translationCSTNU/End');

      }

      if(gatewayTypes.includes(type)){

          this.sendPostData(postData, 'http://localhost:3333/translationCSTNU/XOR');

      }

      //this.sendPostData(postData,postURL);

    });

    this.postExecuted(["shape.delete"], ({ context }) => {

      const { shape } = context;

      const { id } = shape;

      //modeling.updateLabel(shape, id);
      console.log("DELETED");
      console.log(id);
    });

    this.postExecuted(["connection.create"], ({ context }) => {

     const postData = this.getCreatePostDataConnection(context);

     if(context.connection.type === "td:CustomConnector"){

       this.updateIds(context);

     }

     if(context.connection.type === "td:TemporalConstraint"){

       this.sendPostData(postData, 'http://localhost:3333/translationCSTNU/Constraint');

     }

    });

    this.postExecuted(["connection.reconnect"], ({ context }) => {


      //modeling.updateLabel(shape, id);
      console.log("RECONNECT");
    });


  }
}

CSTNUCommandInterceptor.$inject = ["eventBus", "modeling"];

export default {
  __init__: ["CSTNUCommandInterceptor"],
  CSTNUCommandInterceptor: ["type", CSTNUCommandInterceptor]
};
