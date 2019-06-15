# Simple bash script to build the Gnome Shell extension
echo "Zipping the extension..."
zip -r docker-containers@webmastak.zip . -x *.git*
echo "Done building."
