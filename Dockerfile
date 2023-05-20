FROM public.ecr.aws/docker/library/node:16.16.0-slim as builder
WORKDIR /algo-project
COPY . .
RUN npm install --force
RUN npm run build

FROM public.ecr.aws/docker/library/node:16.16.0-slim as runner
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.0 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=3000 NODE_ENV=production
ENV AWS_LWA_ENABLE_COMPRESSION=true
WORKDIR /algo-project
COPY --from=builder /algo-project/public ./public
COPY --from=builder /algo-project/package.json ./package.json
COPY --from=builder /algo-project/.next/standalone ./
COPY --from=builder /algo-project/.next/static ./.next/static
COPY --from=builder /algo-project/run.sh ./run.sh
RUN chmod +x ./run.sh
RUN ln -s /tmp/cache ./.next/cache

CMD exec ./run.sh