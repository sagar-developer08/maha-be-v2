FROM public.ecr.aws/lambda/nodejs:20

COPY . /var/task/

RUN npm i 

CMD [ "app.handler" ]