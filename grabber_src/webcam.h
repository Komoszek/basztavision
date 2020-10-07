/** Small C++ wrapper around V4L example code to access the webcam
**/

#include <string>
#include <memory> // unique_ptr

struct buffer {
      void   *data;
      size_t  size;
};

struct RGBImage {
      unsigned char   *data; // RGBA8888 <=> RGB32
      size_t          width;
      size_t          height;
      size_t          size; // width * height * 4
      uint            id; // input id
};


class Webcam {

public:
    int feedsNumber;
    int input = 0;
    Webcam(const std::string& device = "/dev/video0",
           int width = 640,
           int height = 480, int feedsNumber = 1);

    ~Webcam();

    /** Captures and returns a frame from the webcam.
     *
     * The returned object contains a field 'data' with the image data in RGBA8888
     * format (ie, RGBA32), as well as 'width', 'height' and 'size' (equal to
     * width * height * 4)
     *
     * This call blocks until a frame is available or until the provided
     * timeout (in seconds).
     *
     * Throws a runtime_error if the timeout is reached.
     */
    const RGBImage& frame(int timeout = 1);
    void change_input(int index = 0);
    int next_input();

private:
    void init_mmap();

    void open_device();
    void close_device();

    void init_device();
    void uninit_device();

    void start_capturing();
    void stop_capturing();

    bool read_frame();

    std::string device;
    int fd;

    RGBImage rgb_frame;
    struct buffer          *buffers;
    unsigned int     n_buffers;

    size_t xres, yres;
    size_t stride;

    bool force_format = true;
};
