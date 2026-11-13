
package com.smartcart_ai;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    // Get all orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Get order by ID
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found with ID: " + id
                ));
    }

    // Create a new order
    @Transactional
    public Order createOrder(CreateOrderRequest request) {

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;
        Set<Long> processedProductIds = new HashSet<>();

        for (OrderItemRequest itemRequest : request.getItems()) {

            Long productId = itemRequest.getProductId();
            Integer quantity = itemRequest.getQuantity();

            if (!processedProductIds.add(productId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Duplicate products are not allowed in an order."
                );
            }

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found with ID: " + productId
                    ));

            if (product.getStock() < quantity) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for product: " + product.getName()
                );
            }

            BigDecimal unitPrice = product.getPrice();

            BigDecimal lineTotal = unitPrice.multiply(
                    BigDecimal.valueOf(quantity)
            );

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setLineTotal(lineTotal);

            order.addItem(orderItem);

            product.setStock(product.getStock() - quantity);

            totalAmount = totalAmount.add(lineTotal);
        }

        order.setTotalAmount(totalAmount);

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
