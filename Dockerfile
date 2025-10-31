FROM nginx:alpine

# Delete default configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy our frontend to the folder exposed by nginx
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80