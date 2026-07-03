# Use nginx alpine image (lightweight)
FROM nginx:alpine

# Copy your website files to nginx's default directory
COPY . /usr/share/nginx/html

# Expose port 80 (nginx default)
EXPOSE 80