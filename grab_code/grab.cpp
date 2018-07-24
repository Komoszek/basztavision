#include <iostream>
#include <fstream>

#include "webcam.h"
#include <jpeglib.h>

#define XRES 640
#define YRES 480

using namespace std;

static unsigned char jpegQuality = 70;

static void jpegWrite(unsigned char* img,const char* jpegFilename)
{
    struct jpeg_compress_struct cinfo;
    struct jpeg_error_mgr jerr;

    JSAMPROW row_pointer[1];
    FILE *outfile = fopen( jpegFilename, "wb" );

    // try to open file for saving
    /*if (!outfile) {
        on_exit("jpeg");
    }*/

    // create jpeg data
    cinfo.err = jpeg_std_error( &jerr );
    jpeg_create_compress(&cinfo);
    jpeg_stdio_dest(&cinfo, outfile);

    // set image parameters
    cinfo.image_width = XRES;
    cinfo.image_height = YRES;
    cinfo.input_components = 3;
    cinfo.in_color_space = JCS_RGB;

    // set jpeg compression parameters to default
    jpeg_set_defaults(&cinfo);
    // and then adjust quality setting
    jpeg_set_quality(&cinfo, jpegQuality, TRUE);

    // start compress
    jpeg_start_compress(&cinfo, TRUE);

    // feed data
    while (cinfo.next_scanline < cinfo.image_height) {
        row_pointer[0] = &img[cinfo.next_scanline * cinfo.image_width *  cinfo.input_components];
        jpeg_write_scanlines(&cinfo, row_pointer, 1);
    }

    // finish compression
    jpeg_finish_compress(&cinfo);

    // destroy jpeg data
    jpeg_destroy_compress(&cinfo);

    // close output file
    fclose(outfile);
}

int main(int argc, char** argv)
{
    ofstream image;

    Webcam webcam("/dev/video0", XRES, YRES);
    auto frame = webcam.frame();
    string filename;
    int k = 0;
    int n[2]= {0,0};
struct timespec start, finish;
double elapsed;
    for(;;){

        webcam.change_input(k);
	webcam.frame();

        frame = webcam.frame();
        filename = "/dev/shm/less/camera"+std::to_string(k) + "/" + std::to_string(n[k]) + ".jpeg";
        jpegWrite(frame.data,filename.c_str());

        cout << "camera" + std::to_string(k) + "," + std::to_string(n[k]) + "" << endl;

        n[k]++;
        if(n[k] == 60){
            n[k] = 0;
        }
        k = k == 0 ? 1 : 0;
    }
    return 0;
}
