import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

class MyCommandInterceptor extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    const activityTypes = ["bpmn:Task", "bpmn:SendTask",
                           "bpmn:ReceiveTask", "bpmn:UserTask", "bpmn:ManualTask",
                           "bpmn:BusinessRuleTask", "bpmn:ServiceTask"];

    const startTypes = ["bpmn:StartEvent"];

    const gatewayTypes = ["bpmn:ExclusiveGateway"];

    const connectionTypes = ["bpmn:SequenceFlow"];

    const constraintTypes = ["td:TemporalConstraint"];

    const postURL = 'https://localhost:3333/translationCSTNU';

    this.getCreatePostDataShape = ( context ) => {

      const { shape } = context;

      const { id } = shape;

      const { type } = shape;

      const { x } = shape;

      const { y } = shape;

      let postData;

      if(startTypes.indexOf(type) !== -1){
         postData = {
           type: type,
           id: id,
           x: x,
           y: y
         }

      }

      if(activityTypes.indexOf(type) !== -1){

         postData = {
           type: type,
           id: id,
           x: x,
           y: y
         }
      }

      if(gatewayTypes.indexOf(type) !== -1){

        postData = {
          type: type,
          id: id,
          x: x,
          y: y
        }
      }

      return postData;

    };

    this.getCreatePostDataConnection = (context) => {

      const { shape } = context;

      const { id } = shape;

      const { type } = shape;

      const { x } = shape;

      const { y } = shape;

      let postData;



    };

    this.sendPostData = ( postData ) => {
      const axios = require('axios');

       axios
         .post(postURL, postData)
         .then(res => {
           console.log(`statusCode: ${res.status}`);
           console.log(res);
         })
         .catch(error => {
           console.error(error);
         });

    };

    this.postExecuted(["shape.create"], ({ context }) => {



      const postData = this.getCreatePostDataShape(context);

      this.sendPostData(postData);

    });

    this.postExecuted(["shape.delete"], ({ context }) => {

      const { shape } = context;

      const { id } = shape;

      //modeling.updateLabel(shape, id);
      console.log("DELETED");
      console.log(id);
    });

    this.postExecuted(["connection.create"], ({ context }) => {

      console.log(context);
      //modeling.updateLabel(shape, id);
      console.log("CREATE CONNECTION");
    });

    this.postExecuted(["connection.reconnect"], ({ context }) => {


      //modeling.updateLabel(shape, id);
      console.log("RECONNECT");
    });


  }
}

MyCommandInterceptor.$inject = ["eventBus", "modeling"];

export default {
  __init__: ["myCommandInterceptor"],
  myCommandInterceptor: ["type", MyCommandInterceptor]
};
