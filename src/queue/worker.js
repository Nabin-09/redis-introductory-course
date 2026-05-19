import { Worker} from 'bullmq'
import { connection } from './queue.js'

const worker = new Worker(
    "email",
    async(Job)=>{
    console.log("Processing given job...." , Job.id , Job.name , Job.data)
    await new Promise((resolve)=> setTimeout(resolve , 1500))
    console.log(`The given job is completed!` , Job.id , Job.name , Job.data)
    },
    {connection}


)


worker.on("completed", (job)=>{
    console.log("Job done! " , job.id , job.data , job.data);
});


worker.on("failed" , (job , err)=>{
    console.log("Job failed" , job.id , job.data , job.err);
});
