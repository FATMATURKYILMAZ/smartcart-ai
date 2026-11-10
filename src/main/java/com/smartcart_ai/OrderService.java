
package com.smartcart_ai;

import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Get all orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

   public Order getOrderById(Long id) {
    return orderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Order not found with ID: " + id
            ));
}

    // Create a new order
    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    // Update order status
   
public Order updateOrderStatus(Long id, String newStatus) {
    Order order = getOrderById(id);

    List<String> validStatuses = List.of(
            "PENDING",
            "CONFIRMED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
    );

    String status = newStatus.trim().toUpperCase();

    if (!validStatuses.contains(status)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid order status: " + newStatus
        );
    }

    order.setStatus(status);

    return orderRepository.save(order);
}
    // Delete order
    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}

