# Use nginx alpine for lightweight image
FROM nginx:alpine

# Copy all project files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY login.html /usr/share/nginx/html/
COPY register.html /usr/share/nginx/html/
COPY config.js /usr/share/nginx/html/
COPY supabase-client.js /usr/share/nginx/html/
COPY styles/ /usr/share/nginx/html/styles/
COPY events.json /usr/share/nginx/html/
COPY todos.json /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 (Heroku will map this to $PORT)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
