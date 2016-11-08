package ae.core;

public interface InputListener {

	default void onKeyDown(
		int key) {}

	default void onKeyUp(
		int key) {}

	default void onMouseButtonDown(
        int button,
        int x,
        int y) {}

	default void onMouseButtonUp(
        int button,
        int x,
        int y) {}

	default void onMouseMove(
        int     x,
        int     y,
        int     dx,
        int     dy,
        boolean left,
        boolean middle,
        boolean right) {}

	default void onMouseWheel(
        int     wheel,
        int     x,
        int     y,
        boolean left,
        boolean middle,
        boolean right) {}
}
